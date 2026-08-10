using EventParkingReservationSystem.API.DTOs.Auth;
using EventParkingReservationSystem.API.Enums;
using EventParkingReservationSystem.API.Helpers;
using EventParkingReservationSystem.API.Models;
using EventParkingReservationSystem.API.Repositories.Interfaces;
using EventParkingReservationSystem.API.Services.Interfaces;

using System.Net;

namespace EventParkingReservationSystem.API.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly IJwtService _jwtService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;


        public AuthService(
            ICustomerRepository customerRepository,
            IJwtService jwtService,
            IEmailService emailService,
            IConfiguration configuration
        )
        {
            _customerRepository = customerRepository;
            _jwtService = jwtService;
            _emailService = emailService;
            _configuration = configuration;
        }


        // =====================================================
        // REGISTER
        // =====================================================

        public async Task<RegisterResponseDto> RegisterAsync(
            RegisterRequestDto request
        )
        {
            string normalizedEmail =
                request.Email
                    .Trim()
                    .ToLowerInvariant();


            bool emailExists =
                await _customerRepository.EmailExistsAsync(
                    normalizedEmail
                );


            if (emailExists)
            {
                throw new InvalidOperationException(
                    "An account with this email already exists."
                );
            }


            string verificationToken =
                TokenGenerator.GenerateToken();


            var customer =
                new Customer
                {
                    FirstName =
                        request.FirstName.Trim(),

                    LastName =
                        request.LastName.Trim(),

                    Email =
                        normalizedEmail,

                    PhoneNumber =
                        string.IsNullOrWhiteSpace(
                            request.PhoneNumber
                        )
                            ? null
                            : request.PhoneNumber.Trim(),

                    PasswordHash =
                        PasswordHasher.HashPassword(
                            request.Password
                        ),

                    Role =
                        "Customer",

                    Status =
                        CustomerStatus.PendingVerification,

                    IsEmailVerified =
                        false,

                    EmailVerificationToken =
                        verificationToken,

                    EmailVerificationTokenExpiresAt =
                        DateTime.UtcNow.AddHours(24),

                    CreatedAt =
                        DateTime.UtcNow
                };


            customer =
                await _customerRepository.AddAsync(
                    customer
                );


            await SendVerificationEmailAsync(
                customer,
                verificationToken
            );


            return new RegisterResponseDto
            {
                CustomerId =
                    customer.Id,

                Email =
                    customer.Email,

                Message =
                    "Account created successfully. Please check your email and verify your account.",

                RequiresEmailVerification =
                    true
            };
        }


        // =====================================================
        // VERIFY EMAIL
        // =====================================================

        public async Task<string> VerifyEmailAsync(
            string token
        )
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                throw new ArgumentException(
                    "Verification token is required."
                );
            }


            var customer =
                await _customerRepository
                    .GetByVerificationTokenAsync(
                        token.Trim()
                    );


            if (customer == null)
            {
                throw new InvalidOperationException(
                    "Invalid verification token."
                );
            }


            if (customer.IsEmailVerified)
            {
                return
                    "Your email has already been verified.";
            }


            if (
                customer.EmailVerificationTokenExpiresAt == null ||
                customer.EmailVerificationTokenExpiresAt < DateTime.UtcNow
            )
            {
                throw new InvalidOperationException(
                    "Verification token has expired."
                );
            }


            customer.IsEmailVerified =
                true;


            customer.Status =
                CustomerStatus.Active;


            customer.EmailVerificationToken =
                null;


            customer.EmailVerificationTokenExpiresAt =
                null;


            customer.UpdatedAt =
                DateTime.UtcNow;


            await _customerRepository.SaveChangesAsync();


            return
                "Email verified successfully. You can now login.";
        }


        // =====================================================
        // RESEND VERIFICATION
        // =====================================================

        public async Task<string> ResendVerificationAsync(
            ResendVerificationRequestDto request
        )
        {
            string normalizedEmail =
                request.Email
                    .Trim()
                    .ToLowerInvariant();


            var customer =
                await _customerRepository.GetByEmailAsync(
                    normalizedEmail
                );


            /*
             * Security:
             * Do not reveal whether an email exists.
             */

            if (customer == null)
            {
                return
                    "If the account exists and still requires verification, a new verification email has been sent.";
            }


            if (customer.IsEmailVerified)
            {
                return
                    "If the account exists and still requires verification, a new verification email has been sent.";
            }


            if (
                customer.Status !=
                CustomerStatus.PendingVerification
            )
            {
                return
                    "If the account exists and still requires verification, a new verification email has been sent.";
            }


            string newVerificationToken =
                TokenGenerator.GenerateToken();


            customer.EmailVerificationToken =
                newVerificationToken;


            customer.EmailVerificationTokenExpiresAt =
                DateTime.UtcNow.AddHours(24);


            customer.UpdatedAt =
                DateTime.UtcNow;


            await _customerRepository.SaveChangesAsync();


            await SendVerificationEmailAsync(
                customer,
                newVerificationToken
            );


            return
                "A new verification email has been sent. Please check your inbox.";
        }


        // =====================================================
        // LOGIN
        // =====================================================

        public async Task<LoginResponseDto> LoginAsync(
            LoginRequestDto request
        )
        {
            string normalizedEmail =
                request.Email
                    .Trim()
                    .ToLowerInvariant();


            var customer =
                await _customerRepository.GetByEmailAsync(
                    normalizedEmail
                );


            if (customer == null)
            {
                throw new UnauthorizedAccessException(
                    "Invalid email or password."
                );
            }


            bool passwordValid =
                PasswordHasher.VerifyPassword(
                    request.Password,
                    customer.PasswordHash
                );


            if (!passwordValid)
            {
                throw new UnauthorizedAccessException(
                    "Invalid email or password."
                );
            }


            if (!customer.IsEmailVerified)
            {
                throw new InvalidOperationException(
                    "Please verify your email before logging in."
                );
            }


            if (
                customer.Status !=
                CustomerStatus.Active
            )
            {
                throw new InvalidOperationException(
                    "Your account is not active."
                );
            }


            var jwt =
                _jwtService.GenerateToken(
                    customer
                );


            customer.LastLoginAt =
                DateTime.UtcNow;


            customer.UpdatedAt =
                DateTime.UtcNow;


            await _customerRepository.SaveChangesAsync();


            return new LoginResponseDto
            {
                Token =
                    jwt.Token,

                ExpiresAt =
                    jwt.ExpiresAt,

                CustomerId =
                    customer.Id,

                FirstName =
                    customer.FirstName,

                LastName =
                    customer.LastName,

                Email =
                    customer.Email,

                Role =
                    customer.Role
            };
        }


        // =====================================================
        // FORGOT PASSWORD
        // =====================================================

        public async Task<string> ForgotPasswordAsync(
            ForgotPasswordRequestDto request
        )
        {
            string normalizedEmail =
                request.Email
                    .Trim()
                    .ToLowerInvariant();


            var customer =
                await _customerRepository.GetByEmailAsync(
                    normalizedEmail
                );


            /*
             * Security:
             * Email exists or not என்பதை frontend-க்கு
             * reveal பண்ணக்கூடாது.
             */

            if (
                customer == null ||
                !customer.IsEmailVerified ||
                customer.Status != CustomerStatus.Active
            )
            {
                return
                    "If an active account exists for this email, a password reset link has been sent.";
            }


            // =================================================
            // GENERATE PASSWORD RESET TOKEN
            // =================================================

            string resetToken =
                TokenGenerator.GenerateToken();


            customer.PasswordResetToken =
                resetToken;


            customer.PasswordResetTokenExpiresAt =
                DateTime.UtcNow.AddHours(1);


            customer.UpdatedAt =
                DateTime.UtcNow;


            await _customerRepository.SaveChangesAsync();


            // =================================================
            // CREATE RESET PASSWORD LINK
            // =================================================

            string frontendUrl =
                _configuration[
                    "EmailSettings:FrontendUrl"
                ]
                ?? throw new InvalidOperationException(
                    "Frontend URL is not configured."
                );


            frontendUrl =
                frontendUrl.TrimEnd('/');


            string encodedToken =
                Uri.EscapeDataString(
                    resetToken
                );


            string resetLink =
                $"{frontendUrl}/pages/auth/reset-password.html?token={encodedToken}";


            string safeFirstName =
                WebUtility.HtmlEncode(
                    customer.FirstName
                );


            string safeResetLink =
                WebUtility.HtmlEncode(
                    resetLink
                );


            // =================================================
            // PASSWORD RESET EMAIL BODY
            // =================================================

            string emailBody =
                $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
</head>

<body style=""font-family:Arial,sans-serif;
             background:#f5f5f5;
             padding:30px;"">

    <div style=""max-width:600px;
                margin:auto;
                background:white;
                padding:30px;
                border-radius:10px;"">

        <h2>
            Reset your EventPark password
        </h2>

        <p>
            Hello {safeFirstName},
        </p>

        <p>
            We received a request to reset
            your EventPark account password.
        </p>

        <p style=""margin:30px 0;"">

            <a href=""{safeResetLink}""
               style=""background:#2563eb;
                      color:white;
                      padding:12px 24px;
                      text-decoration:none;
                      border-radius:6px;
                      display:inline-block;"">

                Reset Password

            </a>

        </p>

        <p>
            This password reset link expires in 1 hour.
        </p>

        <p>
            If you did not request a password reset,
            you can safely ignore this email.
        </p>

    </div>

</body>
</html>";


            // =================================================
            // SEND PASSWORD RESET EMAIL
            // =================================================

            await _emailService.SendEmailAsync(
                customer.Email,
                "Reset your EventPark password",
                emailBody
            );


            return
                "If an active account exists for this email, a password reset link has been sent.";
        }


        // =====================================================
        // RESET PASSWORD
        // =====================================================

        public async Task<string> ResetPasswordAsync(
            ResetPasswordRequestDto request
        )
        {
            // -------------------------------------------------
            // CHECK TOKEN
            // -------------------------------------------------

            if (
                string.IsNullOrWhiteSpace(
                    request.Token
                )
            )
            {
                throw new ArgumentException(
                    "Reset token is required."
                );
            }


            // -------------------------------------------------
            // FIND CUSTOMER USING RESET TOKEN
            // -------------------------------------------------

            var customer =
                await _customerRepository
                    .GetByPasswordResetTokenAsync(
                        request.Token.Trim()
                    );


            // -------------------------------------------------
            // INVALID OR ALREADY USED TOKEN
            // -------------------------------------------------

            if (customer == null)
            {
                throw new InvalidOperationException(
                    "This password reset link is invalid or has already been used."
                );
            }


            // -------------------------------------------------
            // CHECK EXPIRY
            // -------------------------------------------------

            if (
                customer.PasswordResetTokenExpiresAt == null ||
                customer.PasswordResetTokenExpiresAt < DateTime.UtcNow
            )
            {
                customer.PasswordResetToken =
                    null;


                customer.PasswordResetTokenExpiresAt =
                    null;


                customer.UpdatedAt =
                    DateTime.UtcNow;


                await _customerRepository
                    .SaveChangesAsync();


                throw new InvalidOperationException(
                    "This password reset link has expired. Please request a new one."
                );
            }


            // -------------------------------------------------
            // HASH AND SAVE NEW PASSWORD
            // -------------------------------------------------

            customer.PasswordHash =
                PasswordHasher.HashPassword(
                    request.NewPassword
                );


            // -------------------------------------------------
            // CLEAR TOKEN AFTER SUCCESS
            // Makes reset link one-time use
            // -------------------------------------------------

            customer.PasswordResetToken =
                null;


            customer.PasswordResetTokenExpiresAt =
                null;


            customer.UpdatedAt =
                DateTime.UtcNow;


            await _customerRepository
                .SaveChangesAsync();


            return
                "Password reset successfully. You can now login with your new password.";
        }


        // =====================================================
        // SEND VERIFICATION EMAIL
        // =====================================================

        private async Task SendVerificationEmailAsync(
            Customer customer,
            string verificationToken
        )
        {
            string frontendUrl =
                _configuration[
                    "EmailSettings:FrontendUrl"
                ]
                ?? throw new InvalidOperationException(
                    "Frontend URL is not configured."
                );


            frontendUrl =
                frontendUrl.TrimEnd('/');


            string encodedToken =
                Uri.EscapeDataString(
                    verificationToken
                );


            string verificationLink =
                $"{frontendUrl}/pages/auth/verify-email.html?token={encodedToken}";


            string safeFirstName =
                WebUtility.HtmlEncode(
                    customer.FirstName
                );


            string safeVerificationLink =
                WebUtility.HtmlEncode(
                    verificationLink
                );


            string emailBody =
                $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
</head>

<body style=""font-family:Arial,sans-serif;
             background:#f5f5f5;
             padding:30px;"">

    <div style=""max-width:600px;
                margin:auto;
                background:white;
                padding:30px;
                border-radius:10px;"">

        <h2>Welcome to EventPark</h2>

        <p>Hello {safeFirstName},</p>

        <p>
            Please verify your email address
            to activate your EventPark account.
        </p>

        <p style=""margin:30px 0;"">

            <a href=""{safeVerificationLink}""
               style=""background:#2563eb;
                      color:white;
                      padding:12px 24px;
                      text-decoration:none;
                      border-radius:6px;
                      display:inline-block;"">

                Verify Email

            </a>

        </p>

        <p>
            This verification link expires in 24 hours.
        </p>

        <p>
            If you did not create this account,
            you can ignore this email.
        </p>

    </div>

</body>
</html>";


            await _emailService.SendEmailAsync(
                customer.Email,
                "Verify your EventPark account",
                emailBody
            );
        }
    }
}