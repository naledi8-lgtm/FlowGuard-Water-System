import os
import firebase_admin
from firebase_admin import credentials, firestore


def get_db():
    """
    Uses the same Firestore project as the mobile app and the admin
    dashboard - all three services read and write the SAME collections
    (alerts, issueReports, smsSubscribers), so this is the one place the
    Python side needs to authenticate.

    Get service-account.json from Firebase Console > Project Settings >
    Service Accounts > Generate new private key. Never commit it - it's
    a real secret, unlike the mobile app's Firebase config.
    """
    if not firebase_admin._apps:
        cred_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT", "service-account.json")
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    return firestore.client()
