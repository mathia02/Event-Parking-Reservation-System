using EventParkingReservationSystem.API.Models;

namespace EventParkingReservationSystem.API.Repositories.Interfaces
{
    public interface ISeatRepository
    {
        Task<List<Seat>> GetByEventIdAsync(
            int eventId
        );

        Task<Seat?> GetByIdAsync(
            int id
        );

        Task<int> CountByEventIdAsync(
            int eventId
        );

        Task<bool> HasSeatsAsync(
            int eventId
        );

        Task<List<Seat>> GetByRowAsync(
            int eventId,
            string rowLabel
        );

        Task<bool> HasHeldOrBookedSeatsInRowAsync(
            int eventId,
            string rowLabel
        );

        Task AddRangeAsync(
            IEnumerable<Seat> seats
        );

        Task SaveChangesAsync();
    }
}
