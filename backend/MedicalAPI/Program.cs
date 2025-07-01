using MedicalAPI.Models;
using MedicalAPI.Models.Entities;
using MedicalAPI.Repositories;
using MedicalAPI.Repositories.ReportsRepository;
using MedicalAPI.Repositories.UsersRepository;
using MedicalAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
           policy =>
           {
               policy.WithOrigins("http://localhost:4200")
               .AllowAnyHeader()
               .AllowAnyMethod();
           });
});
builder.Services.AddControllers();
builder.Services.AddDbContext<MedicalAppContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton(new ElasticSearchService("https://localhost:9200", "elastic", "placeHolderForPassowrd"));

builder.Services.AddScoped<IUsersRepository, UsersRepository>();
builder.Services.AddScoped<IRepository<UserDetails>, UserDetailsRepository>();
builder.Services.AddScoped<IRepository<Role>, RolesRepository>();
builder.Services.AddScoped<IReportsRepository<Report>, ReportsRepository>();
builder.Services.AddScoped<UsersService>();
builder.Services.AddScoped<PatientsService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
        ClockSkew = TimeSpan.Zero
    };
});
builder.Services.AddAuthorization();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
