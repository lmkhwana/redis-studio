using RedisStudio.Api.Interfaces;
using RedisStudio.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container with JSON options
builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    o.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register Redis connection manager + service
builder.Services.AddSingleton<IRedisConnectionManager, RedisConnectionManager>();
builder.Services.AddScoped<RedisStudio.Api.Services.IRedisService, RedisService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

// Simple health endpoint
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
