using EventParkingReservationSystem.API.Models;

namespace EventParkingReservationSystem.API.Repositories.Interfaces
{
    public interface ICategoryRepository
    {
        Task<List<EventCategory>> GetAllAsync();

        Task<EventCategory?> GetByIdAsync(int id);

        Task<bool> NameExistsAsync(
            string name,
            int? excludeCategoryId = null
        );

        Task<bool> HasEventsAsync(int categoryId);

        Task<EventCategory> AddAsync(
            EventCategory category
        );

        void Delete(
            EventCategory category
        );

        Task SaveChangesAsync();
    }
}
