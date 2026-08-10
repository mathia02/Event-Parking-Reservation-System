using EventParkingReservationSystem.API.Models;

namespace EventParkingReservationSystem.API.Repositories.Interfaces
{
    public interface IVenueRepository
    {
        Task<List<Venue>> GetAllAsync();

        Task<Venue?> GetByIdAsync(
            int id
        );

        Task<bool> NameExistsAsync(
            string name,
            int? excludeVenueId = null
        );

        Task<List<Venue>> GetAvailableAsync(
            DateTime eventDate,
            TimeSpan startTime,
            TimeSpan endTime
        );

        Task<bool> HasEventsAsync(
            int venueId
        );

        Task<Venue> AddAsync(
            Venue venue
        );

        Task SaveChangesAsync();

        void Delete(
            Venue venue
        );
    }
}
