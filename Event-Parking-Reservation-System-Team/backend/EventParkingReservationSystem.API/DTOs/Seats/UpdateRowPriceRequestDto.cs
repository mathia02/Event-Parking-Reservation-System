using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.DTOs.Seats
{
    public class UpdateRowPriceRequestDto
    {
        [Required(
            ErrorMessage = "Row label is required."
        )]
        [StringLength(
            10,
            MinimumLength = 1,
            ErrorMessage = "Row label is invalid."
        )]
        public string RowLabel { get; set; } =
            string.Empty;


        [Range(
            0,
            double.MaxValue,
            ErrorMessage = "Price override cannot be negative."
        )]
        public decimal? PriceOverride { get; set; }
    }
}