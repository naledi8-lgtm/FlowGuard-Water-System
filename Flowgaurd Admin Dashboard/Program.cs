using FlowGuard.Admin.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<FirestoreService>();
builder.Services.AddCors();

var app = builder.Build();
app.UseDefaultFiles();
app.UseStaticFiles(); // serves wwwroot/index.html - the admin UI
app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

// Same Firestore collections the mobile app and the Python USSD service
// read and write - this is the "municipal dashboard" from your original
// architecture diagram, now with somewhere real to plug into.
app.MapGet("/api/alerts", async (FirestoreService fs) => await fs.GetAlertsAsync());

app.MapPost("/api/alerts", async (FirestoreService fs, AlertDto dto) =>
{
    var id = await fs.CreateAlertAsync(dto);
    return Results.Created($"/api/alerts/{id}", new { id });
});

app.MapGet("/api/reports", async (FirestoreService fs) => await fs.GetIssueReportsAsync());

app.MapPost("/api/reports/{id}/status", async (FirestoreService fs, string id, StatusDto dto) =>
{
    await fs.UpdateReportStatusAsync(id, dto.Status);
    return Results.Ok();
});

app.Run();

public record AlertDto(string Title, string Description, string Severity, string Area, double Lat, double Lng, bool NotifyOffline);
public record StatusDto(string Status);
