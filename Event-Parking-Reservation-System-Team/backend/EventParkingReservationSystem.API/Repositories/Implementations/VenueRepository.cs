using EventParkingReservationSystem.API.Data;
using EventParkingReservationSystem.API.Models;
using EventParkingReservationSystem.API.Repositories.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Implementations
{
    public class VenueRepository : IVenueRepository
    {
        private readonly ApplicationDbContext _context;


        public VenueRepository(
            ApplicationDbContext context
        )
        {
            _context = context;
        }


        // =====================================================
        // GET ALL VENUES
        // =====================================================

        public async Task<List<Venue>> GetAllAsync()
        {
            return await _context.Venues
                .AsNoTracking()
                .OrderBy(
                    venue => venue.Name
                )
                .ToListAsync();
        }


        // =====================================================
        // GET VENUE BY ID
        // =====================================================

        public async Task<Venue?> GetByIdAsync(
            int id
        )
        {
            return await _context.Venues
                .FirstOrDefaultAsync(
                    venue =>
                        venue.Id == id
                );
        }


        // =====================================================
        // CHECK DUPLICATE VENUE NAME
        // =====================================================

        public async Task<bool> NameExistsAsync(
            string name,
            int? excludeVenueId = null
        )
        {
            string normalizedName =
                name
                    .Trim()
                    .ToLowerInvariant();


            return await _context.Venues
                .AnyAsync(
                    venue =>
                        venue.Name.ToLower()
                            == normalizedName
                        &&
                        (
                            excludeVenueId == null ||
                            venue.Id != excludeVenueId.Value
                        )
                );
        }


        // =====================================================
        // GET AVAILABLE VENUES
        //
        // Venue is unavailable when another event:
        //
        // Same Date
        // AND
        // requested start < existing end
        // AND
        // existing start < requested end
        // =====================================================

        public async Task<List<Venue>> GetAvailableAsync(
            DateTime eventDate,
            TimeSpan startTime,
            TimeSpan endTime
        )
        {
            DateTime requestedDate =
                eventDate.Date;


            var occupiedVenueIds =
                _context.Events
                    .Where(
                        existingEvent =>
                            existingEvent.EventDate.Date
                                == requestedDate
                            &&
                            startTime
                                < existingEvent.EndTime
                            &&
                            existingEvent.StartTime
                                < endTime
                    )
                    .Select(
                        existingEvent =>
                            existingEvent.VenueId
                    );


            return await _context.Venues
                .AsNoTracking()
                .Where(
                    venue =>
                        !occupiedVenueIds.Contains(
                            venue.Id
                        )
                )
                .OrderBy(
                    venue =>
                        venue.Name
                )
                .ToListAsync();
        }


        // =====================================================
        // CHECK VENUE HAS EVENTS
        // =====================================================

        public async Task<bool> HasEventsAsync(
            int venueId
        )
        {
            return await _context.Events
                .AnyAsync(
                    existingEvent =>
                        existingEvent.VenueId
                            == venueId
                );
        }


        // =====================================================
        // ADD VENUE
        // =====================================================

        public async Task<Venue> AddAsync(
            Venue venue
        )
        {
            await _context.Venues.AddAsync(
                venue
            );


            await _context.SaveChangesAsync();


            return venue;
        }


        // =====================================================
        // DELETE VENUE
        // =====================================================

        public void Delete(
            Venue venue
        )
        {
            _context.Venues.Remove(
                venue
            );
        }


        // =====================================================
        // SAVE CHANGES
        // =====================================================

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
