using Google.Cloud.Firestore;

namespace FlowGuard.Admin.Services;

/// <summary>
/// Uses Google.Cloud.Firestore directly (the officially supported .NET path
/// to Firestore) rather than a community wrapper. Point
/// GOOGLE_APPLICATION_CREDENTIALS at the same service-account.json the
/// Python service uses - see README.md > "Where secrets live".
/// </summary>
public class FirestoreService
{
    private readonly FirestoreDb _db;

    public FirestoreService(IConfiguration config)
    {
        _db = FirestoreDb.Create(config["Firebase:ProjectId"]);
    }

    public async Task<List<Dictionary<string, object>>> GetAlertsAsync()
    {
        var snapshot = await _db.Collection("alerts").OrderByDescending("createdAt").GetSnapshotAsync();
        return snapshot.Documents.Select(ToDictWithId).ToList();
    }

    public async Task<string> CreateAlertAsync(AlertDto dto)
    {
        var doc = await _db.Collection("alerts").AddAsync(new
        {
            title = dto.Title,
            description = dto.Description,
            severity = dto.Severity,
            area = dto.Area,
            lat = dto.Lat,
            lng = dto.Lng,
            notifyOffline = dto.NotifyOffline,
            createdAt = Timestamp.GetCurrentTimestamp()
        });
        return doc.Id;
    }

    public async Task<List<Dictionary<string, object>>> GetIssueReportsAsync()
    {
        var snapshot = await _db.Collection("issueReports").OrderByDescending("createdAt").GetSnapshotAsync();
        return snapshot.Documents.Select(ToDictWithId).ToList();
    }

    public async Task UpdateReportStatusAsync(string id, string status)
    {
        await _db.Collection("issueReports").Document(id).UpdateAsync("status", status);
    }

    private static Dictionary<string, object> ToDictWithId(DocumentSnapshot d)
    {
        var data = d.ToDictionary();
        data["id"] = d.Id;
        return data;
    }
}
