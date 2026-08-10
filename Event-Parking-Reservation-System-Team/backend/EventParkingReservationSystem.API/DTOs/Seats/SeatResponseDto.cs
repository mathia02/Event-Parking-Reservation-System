namespace EventParkingReservationSystem.API.DTOs.Seats
{
    public class SeatResponseDto
    {
        public int Id { get; set; }

        public int EventId { get; set; }

        public string SeatNumber { get; set; } =
            string.Empty;

        public string RowLabel { get; set; } =
            string.Empty;

        public int ColumnNumber { get; set; }

        public decimal? PriceOverride { get; set; }

        public decimal EffectivePrice { get; set; }

        public string Status { get; set; } =
            string.Empty;
    }
}