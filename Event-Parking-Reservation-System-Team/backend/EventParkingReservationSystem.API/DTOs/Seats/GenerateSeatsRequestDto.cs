using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.DTOs.Seats
{
    public class GenerateSeatsRequestDto
    {
        [Range(
            1,
            100,
            ErrorMessage = "Rows must be between 1 and 100."
        )]
        public int Rows { get; set; }

        [Range(
            1,
            100,
            ErrorMessage = "Seats per row must be between 1 and 100."
        )]
        public int SeatsPerRow { get; set; }
    }
}