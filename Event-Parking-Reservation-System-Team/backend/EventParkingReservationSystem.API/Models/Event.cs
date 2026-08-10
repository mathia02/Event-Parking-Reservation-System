namespace EventParkingReservationSystem.API.Models
{
    public class Event
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string ImageUrl { get; set; } = string.Empty;

        // Venue
        public int VenueId { get; set; }

        public Venue? Venue { get; set; }


        // Category
        public int CategoryId { get; set; }

        public EventCategory? Category { get; set; }


        // Event Schedule
        public DateTime EventDate { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }


        // Price
        public decimal TicketPrice { get; set; }


        // Event Capacity
        public int Capacity { get; set; }


        // Audit Fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}
