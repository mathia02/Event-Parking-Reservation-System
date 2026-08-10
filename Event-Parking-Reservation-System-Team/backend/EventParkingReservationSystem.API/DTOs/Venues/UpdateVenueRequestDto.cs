using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.DTOs.Venues
{
    public class UpdateVenueRequestDto
    {
        [Required(
            ErrorMessage = "Venue name is required."
        )]
        [StringLength(
            150,
            MinimumLength = 2,
            ErrorMessage = "Venue name must be between 2 and 150 characters."
        )]
        public string Name { get; set; }
            = string.Empty;


        [Required(
            ErrorMessage = "Venue address is required."
        )]
        [StringLength(
            300,
            MinimumLength = 3,
            ErrorMessage = "Venue address must be between 3 and 300 characters."
        )]
        public string Address { get; set; }
            = string.Empty;


        [Range(
            1,
            int.MaxValue,
            ErrorMessage = "Venue capacity must be greater than zero."
        )]
        public int TotalCapacity { get; set; }
    }
}