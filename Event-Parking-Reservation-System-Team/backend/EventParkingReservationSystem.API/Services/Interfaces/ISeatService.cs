using EventParkingReservationSystem.API.DTOs.Seats;

namespace EventParkingReservationSystem.API.Services.Interfaces
{
    public interface ISeatService
    {
        Task<List<SeatResponseDto>> GetByEventIdAsync(
            int eventId
        );

        Task<List<SeatResponseDto>> GenerateSeatsAsync(
            int eventId,
            GenerateSeatsRequestDto request
        );

        Task<List<SeatResponseDto>> UpdateRowPriceAsync(
            int eventId,
            UpdateRowPriceRequestDto request
        );

        Task<SeatResponseDto> UpdateSeatStatusAsync(
            int seatId,
            UpdateSeatStatusRequestDto request
        );
    }
}
