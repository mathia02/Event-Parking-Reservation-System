using EventParkingReservationSystem.API.Data;
using EventParkingReservationSystem.API.Models;
using EventParkingReservationSystem.API.Repositories.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Implementations
{
    public class EventRepository : IEventRepository
    {
        private readonly ApplicationDbContext _context;


        public EventRepository(
            ApplicationDbContext context
        )
        {
            _context = context;
        }


        // =====================================================
        // GET ALL EVENTS
        // Includes Venue + Category
        // =====================================================

        public async Task<List<Event>> GetAllAsync()
        {
            return await _context.Events
                .AsNoTracking()
                .Include(eventItem => eventItem.Venue)
                .Include(eventItem => eventItem.Category)
                .OrderBy(eventItem => eventItem.EventDate)
                .ThenBy(eventItem => eventItem.StartTime)
                .ToListAsync();
        }


        // =====================================================
        // GET EVENT BY ID
        // Tracking enabled because Update/Delete uses this entity
        // =====================================================

        public async Task<Event?> GetByIdAsync(
            int id
        )
        {
            return await _context.Events
                .Include(eventItem => eventItem.Venue)
                .Include(eventItem => eventItem.Category)
                .FirstOrDefaultAsync(
                    eventItem =>
                        eventItem.Id == id
                );
        }


        // =====================================================
        // CHECK VENUE TIME OVERLAP
        //
        // Rule:
        // NewStart < ExistingEnd
        // AND
        // ExistingStart < NewEnd
        //
        // Same Venue + Same Date only
        // =====================================================

        public async Task<bool> HasVenueOverlapAsync(
            int venueId,
            DateTime eventDate,
            TimeSpan startTime,
            TimeSpan endTime,
            int? excludeEventId = null
        )
        {
            DateTime dayStart =
                eventDate.Date;


            DateTime dayEnd =
                dayStart.AddDays(1);


            return await _context.Events
                .AnyAsync(
                    eventItem =>

                        eventItem.VenueId == venueId

                        &&

                        eventItem.EventDate >= dayStart

                        &&

                        eventItem.EventDate < dayEnd

                        &&

                        startTime < eventItem.EndTime

                        &&

                        eventItem.StartTime < endTime

                        &&

                        (
                            excludeEventId == null

                            ||

                            eventItem.Id !=
                            excludeEventId.Value
                        )
                );
        }


        // =====================================================
        // ADD EVENT
        // =====================================================

        public async Task<Event> AddAsync(
            Event eventItem
        )
        {
            await _context.Events
                .AddAsync(
                    eventItem
                );


            await _context.SaveChangesAsync();


            return eventItem;
        }


        // =====================================================
        // DELETE EVENT
        // =====================================================

        public void Delete(
            Event eventItem
        )
        {
            _context.Events.Remove(
                eventItem
            );
        }


        // =====================================================
        // SAVE UPDATE / DELETE
        // =====================================================

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}