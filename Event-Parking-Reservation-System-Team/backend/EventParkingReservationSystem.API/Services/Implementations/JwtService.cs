using EventParkingReservationSystem.API.Models;
using EventParkingReservationSystem.API.Services.Interfaces;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EventParkingReservationSystem.API.Services.Implementations
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;


        public JwtService(
            IConfiguration configuration
        )
        {
            _configuration = configuration;
        }


        // =====================================================
        // GENERATE JWT TOKEN
        // =====================================================

        public (
            string Token,
            DateTime ExpiresAt
        ) GenerateToken(
            Customer customer
        )
        {
            var issuer =
                _configuration["Jwt:Issuer"]
                ?? throw new InvalidOperationException(
                    "JWT Issuer is not configured."
                );


            var audience =
                _configuration["Jwt:Audience"]
                ?? throw new InvalidOperationException(
                    "JWT Audience is not configured."
                );


            var key =
                _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException(
                    "JWT Key is not configured."
                );


            var expiryMinutesText =
                _configuration["Jwt:ExpiryMinutes"];


            if (
                !int.TryParse(
                    expiryMinutesText,
                    out var expiryMinutes
                )
            )
            {
                expiryMinutes = 120;
            }


            var expiresAt =
                DateTime.UtcNow
                    .AddMinutes(
                        expiryMinutes
                    );


            // =================================================
            // CLAIMS
            // =================================================

            var claims =
                new List<Claim>
                {
                    new Claim(
                        JwtRegisteredClaimNames.Sub,
                        customer.Id.ToString()
                    ),

                    new Claim(
                        ClaimTypes.NameIdentifier,
                        customer.Id.ToString()
                    ),

                    new Claim(
                        ClaimTypes.Email,
                        customer.Email
                    ),

                    new Claim(
                        ClaimTypes.GivenName,
                        customer.FirstName
                    ),

                    new Claim(
                        ClaimTypes.Surname,
                        customer.LastName
                    ),

                    new Claim(
                        ClaimTypes.Role,
                        customer.Role
                    )
                };


            // =================================================
            // SIGNING KEY
            // =================================================

            var securityKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        key
                    )
                );


            var credentials =
                new SigningCredentials(
                    securityKey,
                    SecurityAlgorithms.HmacSha256
                );


            // =================================================
            // TOKEN
            // =================================================

            var token =
                new JwtSecurityToken(
                    issuer: issuer,
                    audience: audience,
                    claims: claims,
                    notBefore: DateTime.UtcNow,
                    expires: expiresAt,
                    signingCredentials: credentials
                );


            var tokenString =
                new JwtSecurityTokenHandler()
                    .WriteToken(
                        token
                    );


            return (
                tokenString,
                expiresAt
            );
        }
    }
}
