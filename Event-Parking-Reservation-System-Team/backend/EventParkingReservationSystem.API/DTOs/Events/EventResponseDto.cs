namespace EventParkingReservationSystem.API.DTOs.Events
{
    public class EventResponseDto
    {
        public int Id { get; set; }


        public string Name { get; set; } =
            string.Empty;


        public string ImageUrl { get; set; } =
            string.Empty;


        public int VenueId { get; set; }


        public string VenueName { get; set; } =
            string.Empty;


        public int CategoryId { get; set; }


        public string CategoryName { get; set; } =
            string.Empty;


        public DateTime EventDate { get; set; }


        public TimeSpan StartTime { get; set; }


        public TimeSpan EndTime { get; set; }


        public decimal TicketPrice { get; set; }


        public int Capacity { get; set; }


        public DateTime CreatedAt { get; set; }


        public DateTime? UpdatedAt { get; set; }
    }
}