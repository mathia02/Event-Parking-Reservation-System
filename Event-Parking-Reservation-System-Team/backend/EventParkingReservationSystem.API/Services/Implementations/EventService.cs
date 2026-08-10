using EventParkingReservationSystem.API.DTOs.Events;
using EventParkingReservationSystem.API.Models;
using EventParkingReservationSystem.API.Repositories.Interfaces;
using EventParkingReservationSystem.API.Services.Interfaces;

namespace EventParkingReservationSystem.API.Services.Implementations
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _eventRepository;

        private readonly IVenueRepository _venueRepository;

        private readonly ICategoryRepository _categoryRepository;


        public EventService(
            IEventRepository eventRepository,
            IVenueRepository venueRepository,
            ICategoryRepository categoryRepository
        )
        {
            _eventRepository =
                eventRepository;


            _venueRepository =
                venueRepository;


            _categoryRepository =
                categoryRepository;
        }


        // =====================================================
        // GET ALL EVENTS
        // =====================================================

        public async Task<List<EventResponseDto>> GetAllAsync()
        {
            var events =
                await _eventRepository.GetAllAsync();


            return events
                .Select(MapToResponse)
                .ToList();
        }


        // =====================================================
        // GET EVENT BY ID
        // =====================================================

        public async Task<EventResponseDto?> GetByIdAsync(
            int id
        )
        {
            if (id <= 0)
            {
                throw new ArgumentException(
                    "Invalid event ID."
                );
            }


            var eventItem =
                await _eventRepository.GetByIdAsync(
                    id
                );


            if (eventItem == null)
            {
                return null;
            }


            return MapToResponse(
                eventItem
            );
        }


        // =====================================================
        // CREATE EVENT
        // =====================================================

        public async Task<EventResponseDto> CreateAsync(
            CreateEventRequestDto request
        )
        {
            // -------------------------------------------------
            // BASIC VALIDATION
            // -------------------------------------------------

            ValidateEventTimes(
                request.StartTime,
                request.EndTime
            );


            ValidateEventDate(
                request.EventDate
            );


            // -------------------------------------------------
            // CHECK VENUE
            // -------------------------------------------------

            var venue =
                await _venueRepository.GetByIdAsync(
                    request.VenueId
                );


            if (venue == null)
            {
                throw new KeyNotFoundException(
                    "Selected venue was not found."
                );
            }


            // -------------------------------------------------
            // CHECK CATEGORY
            // -------------------------------------------------

            var category =
                await _categoryRepository.GetByIdAsync(
                    request.CategoryId
                );


            if (category == null)
            {
                throw new KeyNotFoundException(
                    "Selected category was not found."
                );
            }


            // -------------------------------------------------
            // CAPACITY VALIDATION
            //
            // Event capacity cannot exceed Venue capacity
            // -------------------------------------------------

            ValidateCapacity(
                request.Capacity,
                venue.TotalCapacity
            );


            // -------------------------------------------------
            // VENUE OVERLAP VALIDATION
            // -------------------------------------------------

            bool hasOverlap =
                await _eventRepository.HasVenueOverlapAsync(
                    request.VenueId,
                    request.EventDate,
                    request.StartTime,
                    request.EndTime
                );


            if (hasOverlap)
            {
                throw new InvalidOperationException(
                    "The selected venue already has another event during this date and time."
                );
            }


            // -------------------------------------------------
            // CREATE ENTITY
            // -------------------------------------------------

            var eventItem =
                new Event
                {
                    Name =
                        request.Name.Trim(),

                    ImageUrl =
                        NormalizeImageUrl(
                            request.ImageUrl
                        ),

                    VenueId =
                        request.VenueId,

                    CategoryId =
                        request.CategoryId,

                    EventDate =
                        request.EventDate.Date,

                    StartTime =
                        request.StartTime,

                    EndTime =
                        request.EndTime,

                    TicketPrice =
                        request.TicketPrice,

                    Capacity =
                        request.Capacity,

                    CreatedAt =
                        DateTime.UtcNow
                };


            await _eventRepository.AddAsync(
                eventItem
            );


            // AddAsync only creates the Event.
            // Set these navigation values for response mapping.

            eventItem.Venue =
                venue;


            eventItem.Category =
                category;


            return MapToResponse(
                eventItem
            );
        }


        // =====================================================
        // UPDATE EVENT
        // =====================================================

        public async Task<EventResponseDto> UpdateAsync(
            int id,
            UpdateEventRequestDto request
        )
        {
            if (id <= 0)
            {
                throw new ArgumentException(
                    "Invalid event ID."
                );
            }


            ValidateEventTimes(
                request.StartTime,
                request.EndTime
            );


            ValidateEventDate(
                request.EventDate
            );


            // -------------------------------------------------
            // FIND EVENT
            // -------------------------------------------------

            var eventItem =
                await _eventRepository.GetByIdAsync(
                    id
                );


            if (eventItem == null)
            {
                throw new KeyNotFoundException(
                    "Event not found."
                );
            }


            // -------------------------------------------------
            // FIND VENUE
            // -------------------------------------------------

            var venue =
                await _venueRepository.GetByIdAsync(
                    request.VenueId
                );


            if (venue == null)
            {
                throw new KeyNotFoundException(
                    "Selected venue was not found."
                );
            }


            // -------------------------------------------------
            // FIND CATEGORY
            // -------------------------------------------------

            var category =
                await _categoryRepository.GetByIdAsync(
                    request.CategoryId
                );


            if (category == null)
            {
                throw new KeyNotFoundException(
                    "Selected category was not found."
                );
            }


            // -------------------------------------------------
            // CAPACITY
            // -------------------------------------------------

            ValidateCapacity(
                request.Capacity,
                venue.TotalCapacity
            );


            // -------------------------------------------------
            // OVERLAP CHECK
            //
            // exclude current Event ID
            // -------------------------------------------------

            bool hasOverlap =
                await _eventRepository.HasVenueOverlapAsync(
                    request.VenueId,
                    request.EventDate,
                    request.StartTime,
                    request.EndTime,
                    id
                );


            if (hasOverlap)
            {
                throw new InvalidOperationException(
                    "The selected venue already has another event during this date and time."
                );
            }


            // -------------------------------------------------
            // UPDATE ENTITY
            // -------------------------------------------------

            eventItem.Name =
                request.Name.Trim();


            eventItem.ImageUrl =
                NormalizeImageUrl(
                    request.ImageUrl
                );


            eventItem.VenueId =
                request.VenueId;


            eventItem.CategoryId =
                request.CategoryId;


            eventItem.EventDate =
                request.EventDate.Date;


            eventItem.StartTime =
                request.StartTime;


            eventItem.EndTime =
                request.EndTime;


            eventItem.TicketPrice =
                request.TicketPrice;


            eventItem.Capacity =
                request.Capacity;


            eventItem.UpdatedAt =
                DateTime.UtcNow;


            // Keep navigation objects synchronized
            // so response shows correct Venue/Category names.

            eventItem.Venue =
                venue;


            eventItem.Category =
                category;


            await _eventRepository.SaveChangesAsync();


            return MapToResponse(
                eventItem
            );
        }


        // =====================================================
        // DELETE EVENT
        // =====================================================

        public async Task DeleteAsync(
            int id
        )
        {
            if (id <= 0)
            {
                throw new ArgumentException(
                    "Invalid event ID."
                );
            }


            var eventItem =
                await _eventRepository.GetByIdAsync(
                    id
                );


            if (eventItem == null)
            {
                throw new KeyNotFoundException(
                    "Event not found."
                );
            }


            _eventRepository.Delete(
                eventItem
            );


            await _eventRepository.SaveChangesAsync();
        }


        // =====================================================
        // VALIDATE DATE
        // =====================================================

        private static void ValidateEventDate(
            DateTime eventDate
        )
        {
            if (eventDate == default)
            {
                throw new ArgumentException(
                    "Event date is required."
                );
            }
        }


        // =====================================================
        // VALIDATE START / END TIME
        // =====================================================

        private static void ValidateEventTimes(
            TimeSpan startTime,
            TimeSpan endTime
        )
        {
            if (startTime >= endTime)
            {
                throw new ArgumentException(
                    "Event end time must be later than the start time."
                );
            }
        }


        // =====================================================
        // VALIDATE CAPACITY
        // =====================================================

        private static void ValidateCapacity(
            int eventCapacity,
            int venueCapacity
        )
        {
            if (eventCapacity <= 0)
            {
                throw new ArgumentException(
                    "Event capacity must be greater than zero."
                );
            }


            if (eventCapacity > venueCapacity)
            {
                throw new InvalidOperationException(
                    $"Event capacity cannot exceed the selected venue capacity of {venueCapacity}."
                );
            }
        }


        // =====================================================
        // NORMALIZE IMAGE URL
        // =====================================================

        private static string NormalizeImageUrl(
            string? imageUrl
        )
        {
            if (string.IsNullOrWhiteSpace(imageUrl))
            {
                return string.Empty;
            }


            return imageUrl.Trim();
        }


        // =====================================================
        // MAP EVENT TO RESPONSE DTO
        // =====================================================

        private static EventResponseDto MapToResponse(
            Event eventItem
        )
        {
            return new EventResponseDto
            {
                Id =
                    eventItem.Id,

                Name =
                    eventItem.Name,

                ImageUrl =
                    eventItem.ImageUrl ?? string.Empty,

                VenueId =
                    eventItem.VenueId,

                VenueName =
                    eventItem.Venue?.Name ??
                    string.Empty,

                CategoryId =
                    eventItem.CategoryId,

                CategoryName =
                    eventItem.Category?.Name ??
                    string.Empty,

                EventDate =
                    eventItem.EventDate,

                StartTime =
                    eventItem.StartTime,

                EndTime =
                    eventItem.EndTime,

                TicketPrice =
                    eventItem.TicketPrice,

                Capacity =
                    eventItem.Capacity,

                CreatedAt =
                    eventItem.CreatedAt,

                UpdatedAt =
                    eventItem.UpdatedAt
            };
        }
    }
}