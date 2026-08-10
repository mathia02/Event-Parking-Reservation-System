using EventParkingReservationSystem.API.DTOs.Auth;

namespace EventParkingReservationSystem.API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<RegisterResponseDto> RegisterAsync(
            RegisterRequestDto request
        );

        Task<string> VerifyEmailAsync(
            string token
        );

        Task<string> ResendVerificationAsync(
            ResendVerificationRequestDto request
        );

        Task<LoginResponseDto> LoginAsync(
            LoginRequestDto request
        );

        Task<string> ForgotPasswordAsync(
            ForgotPasswordRequestDto request
        );
        Task<string> ResetPasswordAsync(
             ResetPasswordRequestDto request
);
    }
}