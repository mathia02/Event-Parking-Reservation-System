using EventParkingReservationSystem.API.Models;

namespace EventParkingReservationSystem.API.Services.Interfaces
{
    public interface IJwtService
    {
        (string Token, DateTime ExpiresAt) GenerateToken(
            Customer customer
        );
    }
}
