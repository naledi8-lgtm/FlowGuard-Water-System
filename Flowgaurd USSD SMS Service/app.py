"""
FlowGuard USSD + SMS service.

Handles residents without smartphones: they dial a USSD code, pick their
area from a numbered menu (feature phones can't do GPS), and get SMS
alerts for that area from then on. Also exposes an internal endpoint that
a Firestore-triggered Cloud Function calls when a new alert needs to fan
out over SMS - see README.md > "Where secrets live" for why that call
comes from here and never from the mobile app directly.

Sandbox setup: create a free Africa's Talking account, switch to Sandbox,
create a USSD channel pointing at this app's /ussd endpoint (via ngrok
while developing locally), and test with their simulator - no real
shortcode or telco contract needed for a demo. See README.md for the
step-by-step and for ConnectMobile as a South-Africa-native alternative.
"""

from flask import Flask, request, Response
from datetime import datetime, timezone
from firestore_client import get_db

app = Flask(__name__)
db = get_db()

# In-memory list for the demo - swap for a Firestore "areas" collection
# once the admin dashboard can manage this list itself.
AREAS = ["Parys Town", "Tumahole", "Schonkenville", "Other / not listed"]


@app.route("/ussd", methods=["POST"])
def ussd():
    """
    Webhook called by your USSD aggregator. Expects sessionId, phoneNumber,
    and text (the digits entered so far, '*'-separated) - this matches
    Africa's Talking's format; adjust field names if your gateway differs.
    Every response starts with CON (show more menu) or END (close session).
    """
    phone_number = request.values.get("phoneNumber", "")
    text = request.values.get("text", "")
    steps = text.split("*") if text else []

    if text == "":
        response = "CON Welcome to FlowGuard\n1. Get water alerts for my area\n2. Report an issue\n3. Change my area"

    elif steps[0] in ("1", "3") and len(steps) == 1:
        options = "\n".join(f"{i + 1}. {area}" for i, area in enumerate(AREAS))
        response = f"CON Select your area:\n{options}"

    elif steps[0] in ("1", "3") and len(steps) == 2:
        idx = int(steps[1]) - 1 if steps[1].isdigit() else -1
        area = AREAS[idx] if 0 <= idx < len(AREAS) else None
        if area:
            db.collection("smsSubscribers").document(phone_number).set({
                "phoneNumber": phone_number,
                "area": area,
                "optedInAt": datetime.now(timezone.utc).isoformat(),
            })
            response = f"END You're registered for {area}. We'll SMS you when there's an update."
        else:
            response = "END That wasn't a valid option. Please dial in again."

    elif steps[0] == "2":
        # Feature phones make multi-field forms painful, so USSD reporting
        # is a single free-text step; an admin follows up by phone rather
        # than replicating the app's full category/photo form.
        if len(steps) == 1:
            response = "CON Briefly describe the issue (e.g. 'burst pipe near clinic'):"
        else:
            description = steps[-1]
            db.collection("issueReports").add({
                "reporterId": None,
                "isAnonymous": False,
                "reporterPhone": phone_number,
                "category": "other",
                "description": description,
                "channel": "ussd",
                "status": "submitted",
                "confirmCount": 0,
                "createdAt": datetime.now(timezone.utc).isoformat(),
            })
            response = "END Thanks - we've logged it and someone will follow up."

    else:
        response = "END Sorry, something went wrong. Please dial in again."

    return Response(response, mimetype="text/plain")


@app.route("/send-alert-sms", methods=["POST"])
def send_alert_sms():
    """
    Called by a Firestore-triggered Cloud Function whenever an alert with
    notifyOffline=true is created. The SMS gateway's secret key lives here,
    server-side - never in the mobile app, which anyone can decompile.
    """
    payload = request.get_json(force=True)
    area = payload.get("area")
    message = f"FlowGuard: {payload.get('title')} - {payload.get('description')}"

    subscribers = db.collection("smsSubscribers").where("area", "==", area).stream()
    numbers = [s.to_dict()["phoneNumber"] for s in subscribers]

    # TODO: replace with your SMS gateway's REST call (Africa's Talking,
    # WinSMS, Clickatell - see README.md for a cost comparison). Batch the
    # send where the provider supports it instead of looping one at a time.
    for number in numbers:
        print(f"[demo] would SMS {number}: {message}")

    return {"sent": len(numbers)}


if __name__ == "__main__":
    app.run(port=5000, debug=True)
