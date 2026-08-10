using EventParkingReservationSystem.API.Models;

namespace EventParkingReservationSystem.API.Repositories.Interfaces
{
    public interface IEventRepository
    {
        Task<List<Event>> GetAllAsync();

        Task<Event?> GetByIdAsync(int id);

        Task<bool> HasVenueOverlapAsync(
            int venueId,
            DateTime eventDate,
            TimeSpan startTime,
            TimeSpan endTime,
            int? excludeEventId = null
        );

        Task<Event> AddAsync(
            Event eventItem
        );

        void Delete(
            Event eventItem
        );

        Task SaveChangesAsync();
    }
}