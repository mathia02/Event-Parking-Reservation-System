using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.DTOs.Events
{
    public class CreateEventRequestDto
    {
        [Required(ErrorMessage = "Event name is required.")]
        [StringLength(
            150,
            MinimumLength = 2,
            ErrorMessage = "Event name must be between 2 and 150 characters."
        )]
        public string Name { get; set; } = string.Empty;


        [StringLength(
            1000,
            ErrorMessage = "Image URL cannot exceed 1000 characters."
        )]
        public string? ImageUrl { get; set; }


        [Range(
            1,
            int.MaxValue,
            ErrorMessage = "Please select a valid venue."
        )]
        public int VenueId { get; set; }


        [Range(
            1,
            int.MaxValue,
            ErrorMessage = "Please select a valid category."
        )]
        public int CategoryId { get; set; }


        [Required(
            ErrorMessage = "Event date is required."
        )]
        public DateTime EventDate { get; set; }


        [Required(
            ErrorMessage = "Start time is required."
        )]
        public TimeSpan StartTime { get; set; }


        [Required(
            ErrorMessage = "End time is required."
        )]
        public TimeSpan EndTime { get; set; }


        [Range(
            0,
            double.MaxValue,
            ErrorMessage = "Ticket price cannot be negative."
        )]
        public decimal TicketPrice { get; set; }


        [Range(
            1,
            int.MaxValue,
            ErrorMessage = "Event capacity must be greater than zero."
        )]
        public int Capacity { get; set; }
    }
}