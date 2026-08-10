using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.DTOs.Seats
{
    public class UpdateSeatStatusRequestDto
    {
        [Required(
            ErrorMessage = "Seat status is required."
        )]
        public string Status { get; set; } =
            string.Empty;
    }
}