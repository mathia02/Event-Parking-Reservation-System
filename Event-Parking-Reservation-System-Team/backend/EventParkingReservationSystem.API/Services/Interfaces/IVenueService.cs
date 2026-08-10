using EventParkingReservationSystem.API.DTOs.Venues;

namespace EventParkingReservationSystem.API.Services.Interfaces
{
    public interface IVenueService
    {
        Task<List<VenueResponseDto>> GetAllAsync();


        Task<VenueResponseDto?> GetByIdAsync(
            int id
        );


        Task<List<VenueResponseDto>> GetAvailableAsync(
            DateTime eventDate,
            TimeSpan startTime,
            TimeSpan endTime
        );


        Task<VenueResponseDto> CreateAsync(
            CreateVenueRequestDto request
        );


        Task<VenueResponseDto> UpdateAsync(
            int id,
            UpdateVenueRequestDto request
        );


        Task DeleteAsync(
            int id
        );
    }
}
