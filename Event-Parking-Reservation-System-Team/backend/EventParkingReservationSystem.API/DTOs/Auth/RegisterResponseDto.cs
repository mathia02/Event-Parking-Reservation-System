namespace EventParkingReservationSystem.API.DTOs.Auth
{
    public class RegisterResponseDto
    {
        public int CustomerId { get; set; }

        public string Email { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public bool RequiresEmailVerification { get; set; }
    }
}