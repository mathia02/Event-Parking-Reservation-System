using EventParkingReservationSystem.API.Data;
using EventParkingReservationSystem.API.Repositories.Implementations;
using EventParkingReservationSystem.API.Repositories.Interfaces;
using EventParkingReservationSystem.API.Services.Implementations;
using EventParkingReservationSystem.API.Services.Interfaces;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

using System.Text;


var builder = WebApplication.CreateBuilder(args);


// ======================================================
// CONTROLLERS
// ======================================================

builder.Services.AddControllers();


// ======================================================
// SWAGGER
// ======================================================

builder.Services.AddEndpointsApiExplorer();


builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title =
                "Event & Parking Reservation System API",

            Version =
                "v1"
        }
    );


    // ==================================================
    // JWT SWAGGER AUTHORIZE
    // ==================================================

    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name =
                "Authorization",

            Type =
                SecuritySchemeType.Http,

            Scheme =
                "bearer",

            BearerFormat =
                "JWT",

            In =
                ParameterLocation.Header,

            Description =
                "Enter the JWT token. Example: eyJhbGciOi..."
        }
    );


    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference =
                        new OpenApiReference
                        {
                            Type =
                                ReferenceType.SecurityScheme,

                            Id =
                                "Bearer"
                        }
                },

                Array.Empty<string>()
            }
        }
    );
});


// ======================================================
// DATABASE
// ======================================================

builder.Services.AddDbContext<ApplicationDbContext>(
    options =>
    {
        options.UseSqlServer(
            builder.Configuration
                .GetConnectionString(
                    "DefaultConnection"
                )
        );
    }
);


// ======================================================
// DEPENDENCY INJECTION
// ======================================================


// ------------------------------------------------------
// EVENT
// ------------------------------------------------------

builder.Services.AddScoped<
    IEventRepository,
    EventRepository
>();


builder.Services.AddScoped<
    IEventService,
    EventService
>();

// ------------------------------------------------------
// VENUE
// ------------------------------------------------------

builder.Services.AddScoped<
    IVenueRepository,
    VenueRepository
>();

builder.Services.AddScoped<
    IVenueService,
    VenueService
>();

// Category

builder.Services.AddScoped<
    ICategoryRepository,
    CategoryRepository
>();

builder.Services.AddScoped<
    ICategoryService,
    CategoryService
>();




// ------------------------------------------------------
// CUSTOMER
// ------------------------------------------------------

builder.Services.AddScoped<
    ICustomerRepository,
    CustomerRepository
>();


// ------------------------------------------------------
// AUTHENTICATION
// ------------------------------------------------------

builder.Services.AddScoped<
    IAuthService,
    AuthService
>();


builder.Services.AddScoped<
    IJwtService,
    JwtService
>();


// ------------------------------------------------------
// EMAIL
// ------------------------------------------------------

builder.Services.AddScoped<
    IEmailService,
    EmailService
>();


// ======================================================
// JWT CONFIGURATION
// ======================================================

var jwtKey =
    builder.Configuration[
        "Jwt:Key"
    ]
    ?? throw new InvalidOperationException(
        "JWT Key is not configured."
    );


var jwtIssuer =
    builder.Configuration[
        "Jwt:Issuer"
    ]
    ?? throw new InvalidOperationException(
        "JWT Issuer is not configured."
    );


var jwtAudience =
    builder.Configuration[
        "Jwt:Audience"
    ]
    ?? throw new InvalidOperationException(
        "JWT Audience is not configured."
    );


// ======================================================
// JWT AUTHENTICATION
// ======================================================

builder.Services
    .AddAuthentication(
        options =>
        {
            options.DefaultAuthenticateScheme =
                JwtBearerDefaults.AuthenticationScheme;


            options.DefaultChallengeScheme =
                JwtBearerDefaults.AuthenticationScheme;
        }
    )
    .AddJwtBearer(
        options =>
        {
            options.TokenValidationParameters =
                new TokenValidationParameters
                {
                    // Validate token issuer
                    ValidateIssuer =
                        true,


                    // Validate token audience
                    ValidateAudience =
                        true,


                    // Validate token expiry
                    ValidateLifetime =
                        true,


                    // Validate signing key
                    ValidateIssuerSigningKey =
                        true,


                    // Expected issuer
                    ValidIssuer =
                        jwtIssuer,


                    // Expected audience
                    ValidAudience =
                        jwtAudience,


                    // Secret key
                    IssuerSigningKey =
                        new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(
                                jwtKey
                            )
                        ),


                    // Token expires exactly
                    ClockSkew =
                        TimeSpan.Zero
                };
        }
    );


// ======================================================
// AUTHORIZATION
// ======================================================

builder.Services.AddAuthorization();


// ======================================================
// CORS
// ======================================================

builder.Services.AddCors(
    options =>
    {
        options.AddPolicy(
            "FrontendPolicy",
            policy =>
            {
                policy
                    .AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            }
        );
    }
);


// ======================================================
// BUILD APPLICATION
// ======================================================

var app =
    builder.Build();


// ======================================================
// DATABASE SEED
// ======================================================

await DatabaseSeeder.SeedAsync(
    app
);


// ======================================================
// SWAGGER
// ======================================================

if (
    app.Environment.IsDevelopment()
)
{
    app.UseSwagger();

    app.UseSwaggerUI();
}


// ======================================================
// HTTPS
// ======================================================

app.UseHttpsRedirection();


// ======================================================
// CORS
// ======================================================

app.UseCors(
    "FrontendPolicy"
);


// ======================================================
// AUTHENTICATION + AUTHORIZATION
// IMPORTANT ORDER
// ======================================================

app.UseAuthentication();

app.UseAuthorization();


// ======================================================
// MAP CONTROLLERS
// ======================================================

app.MapControllers();


// ======================================================
// RUN APPLICATION
// ======================================================

app.Run();