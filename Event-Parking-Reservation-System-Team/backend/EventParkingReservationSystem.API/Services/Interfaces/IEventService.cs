using EventParkingReservationSystem.API.DTOs.Events;

namespace EventParkingReservationSystem.API.Services.Interfaces
{
    public interface IEventService
    {
        Task<List<EventResponseDto>> GetAllAsync();

        Task<EventResponseDto?> GetByIdAsync(int id);

        Task<EventResponseDto> CreateAsync(
            CreateEventRequestDto request
        );

        Task<EventResponseDto> UpdateAsync(
            int id,
            UpdateEventRequestDto request
        );

        Task DeleteAsync(int id);
    }
}