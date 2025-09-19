/*
# DonationsAPI (Minimal API, .NET 9)
# Tracks donations; EF Core + SQLite; mock CRM hook.
*/

using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

/*
# Setup
# - DI, CORS, EF Core, Swagger, CRM client
*/
var builder = WebApplication.CreateBuilder(args);

var allowedOrigin = builder.Configuration["AllowedOrigin"] ?? "http://localhost:3000";

builder.Services.AddCors(o =>
{
    o.AddPolicy("frontend", p =>
        p.WithOrigins(allowedOrigin)
         .AllowAnyHeader()
         .AllowAnyMethod());
});

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")
                  ?? "Data Source=donations.db"));

builder.Services.AddScoped<ICrmClient, MockCrmClient>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Donations API", Version = "v1" });
});

/*
# Pipeline
# - CORS + Swagger (dev)
*/
var app = builder.Build();

app.UseCors("frontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

/*
# Endpoints
# - Health
# - /donations GET, POST
*/
app.MapGet("/", () => Results.Ok(new { ok = true, service = "DonationsAPI" }));

app.MapGet("/donations", async (AppDbContext db) =>
{
    var rows = await db.Donations
        .OrderByDescending(d => d.Date)
        .ToListAsync();

    return Results.Ok(rows);
});

app.MapPost("/donations", async (DonationDto dto, AppDbContext db, ICrmClient crm) =>
{
    if (string.IsNullOrWhiteSpace(dto.DonorName))
        return Results.BadRequest(new { error = "DonorName is required" });
    if (dto.Amount <= 0)
        return Results.BadRequest(new { error = "Amount must be > 0" });

    var entity = new Donation
    {
        DonorName = dto.DonorName.Trim(),
        Amount = dto.Amount,
        Date = dto.Date == default
            ? DateTime.UtcNow
            : DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc)
    };

    db.Donations.Add(entity);
    await db.SaveChangesAsync();

    var crmResult = await crm.SendToCrmAsync(entity);

    return Results.Created($"/donations/{entity.Id}", new { donation = entity, crmResult });
});

app.Run();

/*
# Data + Integration
# - Entity, DTO, DbContext, CRM client
*/
public class Donation
{
    public int Id { get; set; }
    public string DonorName { get; set; } = "";
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
}

public record DonationDto(string DonorName, decimal Amount, DateTime Date);

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Donation> Donations => Set<Donation>();
}

public interface ICrmClient
{
    Task<object> SendToCrmAsync(Donation donation);
}

public class MockCrmClient : ICrmClient
{
    private readonly ILogger<MockCrmClient> _logger;
    public MockCrmClient(ILogger<MockCrmClient> logger) => _logger = logger;

    public Task<object> SendToCrmAsync(Donation donation)
    {
        _logger.LogInformation("MockCRM sent {Id} ({Donor}, {Amt} @ {Date})",
            donation.Id, donation.DonorName, donation.Amount, donation.Date);

        return Task.FromResult<object>(new
        {
            provider = "MockCRM",
            status = "ok",
            echo = new { donation.Id, donation.DonorName, donation.Amount, donation.Date }
        });
    }
}
