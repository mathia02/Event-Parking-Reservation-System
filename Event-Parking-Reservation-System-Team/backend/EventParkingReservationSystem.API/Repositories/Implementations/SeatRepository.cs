using EventParkingReservationSystem.API.Data;
using EventParkingReservationSystem.API.Enums;
using EventParkingReservationSystem.API.Models;
using EventParkingReservationSystem.API.Repositories.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Implementations
{
    public class SeatRepository : ISeatRepository
    {
        private readonly ApplicationDbContext _context;


        public SeatRepository(
            ApplicationDbContext context
        )
        {
            _context = context;
        }


        // =====================================================
        // GET ALL SEATS FOR EVENT
        // Includes Event for Effective Price calculation
        // =====================================================

        public async Task<List<Seat>> GetByEventIdAsync(
            int eventId
        )
        {
            return await _context.Seats
                .AsNoTracking()
                .Include(
                    seat =>
                        seat.Event
                )
                .Where(
                    seat =>
                        seat.EventId == eventId
                )
                .OrderBy(
                    seat =>
                        seat.RowLabel
                )
                .ThenBy(
                    seat =>
                        seat.ColumnNumber
                )
                .ToListAsync();
        }


        // =====================================================
        // GET SEAT BY ID
        // Tracking enabled because status can be updated
        // =====================================================

        public async Task<Seat?> GetByIdAsync(
            int id
        )
        {
            return await _context.Seats
                .Include(
                    seat =>
                        seat.Event
                )
                .FirstOrDefaultAsync(
                    seat =>
                        seat.Id == id
                );
        }


        // =====================================================
        // COUNT EVENT SEATS
        // =====================================================

        public async Task<int> CountByEventIdAsync(
            int eventId
        )
        {
            return await _context.Seats
                .CountAsync(
                    seat =>
                        seat.EventId == eventId
                );
        }


        // =====================================================
        // CHECK EVENT ALREADY HAS SEATS
        // =====================================================

        public async Task<bool> HasSeatsAsync(
            int eventId
        )
        {
            return await _context.Seats
                .AnyAsync(
                    seat =>
                        seat.EventId == eventId
                );
        }


        // =====================================================
        // GET ROW FOR UPDATE
        //
        // Tracking enabled because row PriceOverride
        // will be updated.
        // =====================================================

        public async Task<List<Seat>> GetByRowAsync(
            int eventId,
            string rowLabel
        )
        {
            string normalizedRow =
                rowLabel
                    .Trim()
                    .ToUpperInvariant();


            return await _context.Seats
                .Where(
                    seat =>
                        seat.EventId == eventId
                        &&
                        seat.RowLabel == normalizedRow
                )
                .OrderBy(
                    seat =>
                        seat.ColumnNumber
                )
                .ToListAsync();
        }


        // =====================================================
        // CHECK ROW HAS HELD OR BOOKED SEATS
        //
        // If true:
        // Admin must NOT change row price.
        // =====================================================

        public async Task<bool> HasHeldOrBookedSeatsInRowAsync(
            int eventId,
            string rowLabel
        )
        {
            string normalizedRow =
                rowLabel
                    .Trim()
                    .ToUpperInvariant();


            return await _context.Seats
                .AnyAsync(
                    seat =>
                        seat.EventId == eventId
                        &&
                        seat.RowLabel == normalizedRow
                        &&
                        (
                            seat.Status == SeatStatus.Held
                            ||
                            seat.Status == SeatStatus.Booked
                        )
                );
        }


        // =====================================================
        // ADD GENERATED SEATS
        // =====================================================

        public async Task AddRangeAsync(
            IEnumerable<Seat> seats
        )
        {
            await _context.Seats
                .AddRangeAsync(
                    seats
                );


            await _context.SaveChangesAsync();
        }


        // =====================================================
        // SAVE STATUS / ROW PRICE CHANGES
        // =====================================================

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
