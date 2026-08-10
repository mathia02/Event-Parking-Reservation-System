using EventParkingReservationSystem.API.Enums;

namespace EventParkingReservationSystem.API.Models
{
    public class Seat
    {
        public int Id { get; set; }


        // =====================================================
        // EVENT
        // =====================================================

        public int EventId { get; set; }

        public Event? Event { get; set; }


        // =====================================================
        // SEAT INFORMATION
        //
        // Example:
        // RowLabel     = A
        // ColumnNumber = 1
        // SeatNumber   = A1
        // =====================================================

        public string SeatNumber { get; set; } =
            string.Empty;


        public string RowLabel { get; set; } =
            string.Empty;


        public int ColumnNumber { get; set; }


        // =====================================================
        // PRICE
        //
        // null:
        // Event.TicketPrice will be used.
        //
        // value:
        // PriceOverride will be used.
        // =====================================================

        public decimal? PriceOverride { get; set; }


        // =====================================================
        // STATUS
        //
        // Available
        // Held
        // Booked
        // Unavailable
        // =====================================================

        public SeatStatus Status { get; set; } =
            SeatStatus.Available;


        // =====================================================
        // AUDIT
        // =====================================================

        public DateTime CreatedAt { get; set; } =
            DateTime.UtcNow;


        public DateTime? UpdatedAt { get; set; }
    }
}
