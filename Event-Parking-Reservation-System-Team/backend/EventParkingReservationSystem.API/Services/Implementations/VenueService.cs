using EventParkingReservationSystem.API.DTOs.Venues;
using EventParkingReservationSystem.API.Models;
using EventParkingReservationSystem.API.Repositories.Interfaces;
using EventParkingReservationSystem.API.Services.Interfaces;

namespace EventParkingReservationSystem.API.Services.Implementations
{
    public class VenueService : IVenueService
    {
        private readonly IVenueRepository _venueRepository;


        public VenueService(
            IVenueRepository venueRepository
        )
        {
            _venueRepository =
                venueRepository;
        }


        // =====================================================
        // GET ALL VENUES
        // =====================================================

        public async Task<List<VenueResponseDto>> GetAllAsync()
        {
            var venues =
                await _venueRepository
                    .GetAllAsync();


            return venues
                .Select(
                    MapToResponse
                )
                .ToList();
        }


        // =====================================================
        // GET VENUE BY ID
        // =====================================================

        public async Task<VenueResponseDto?> GetByIdAsync(
            int id
        )
        {
            if (id <= 0)
            {
                throw new ArgumentException(
                    "Invalid venue id."
                );
            }


            var venue =
                await _venueRepository
                    .GetByIdAsync(
                        id
                    );


            if (venue == null)
            {
                return null;
            }


            return MapToResponse(
                venue
            );
        }


        // =====================================================
        // GET AVAILABLE VENUES
        // =====================================================

        public async Task<List<VenueResponseDto>> GetAvailableAsync(
            DateTime eventDate,
            TimeSpan startTime,
            TimeSpan endTime
        )
        {
            // -------------------------------------------------
            // VALIDATE DATE
            // -------------------------------------------------

            if (
                eventDate == default
            )
            {
                throw new ArgumentException(
                    "Event date is required."
                );
            }


            // -------------------------------------------------
            // VALIDATE TIME
            // -------------------------------------------------

            if (
                startTime >= endTime
            )
            {
                throw new ArgumentException(
                    "Event end time must be later than the start time."
                );
            }


            var venues =
                await _venueRepository
                    .GetAvailableAsync(
                        eventDate,
                        startTime,
                        endTime
                    );


            return venues
                .Select(
                    MapToResponse
                )
                .ToList();
        }


        // =====================================================
        // CREATE VENUE
        // =====================================================

        public async Task<VenueResponseDto> CreateAsync(
            CreateVenueRequestDto request
        )
        {
            string venueName =
                request.Name.Trim();


            string address =
                request.Address.Trim();


            // -------------------------------------------------
            // DUPLICATE VENUE NAME
            // -------------------------------------------------

            bool nameExists =
                await _venueRepository
                    .NameExistsAsync(
                        venueName
                    );


            if (nameExists)
            {
                throw new InvalidOperationException(
                    "A venue with this name already exists."
                );
            }


            // -------------------------------------------------
            // CREATE ENTITY
            // -------------------------------------------------

            var venue =
                new Venue
                {
                    Name =
                        venueName,

                    Address =
                        address,

                    TotalCapacity =
                        request.TotalCapacity,

                    CreatedAt =
                        DateTime.UtcNow
                };


            venue =
                await _venueRepository
                    .AddAsync(
                        venue
                    );


            return MapToResponse(
                venue
            );
        }


        // =====================================================
        // UPDATE VENUE
        // =====================================================

        public async Task<VenueResponseDto> UpdateAsync(
            int id,
            UpdateVenueRequestDto request
        )
        {
            if (id <= 0)
            {
                throw new ArgumentException(
                    "Invalid venue id."
                );
            }


            var venue =
                await _venueRepository
                    .GetByIdAsync(
                        id
                    );


            if (venue == null)
            {
                throw new KeyNotFoundException(
                    "Venue not found."
                );
            }


            string venueName =
                request.Name.Trim();


            string address =
                request.Address.Trim();


            // -------------------------------------------------
            // DUPLICATE VENUE NAME
            // Ignore current venue itself
            // -------------------------------------------------

            bool nameExists =
                await _venueRepository
                    .NameExistsAsync(
                        venueName,
                        id
                    );


            if (nameExists)
            {
                throw new InvalidOperationException(
                    "Another venue with this name already exists."
                );
            }


            // -------------------------------------------------
            // CAPACITY SAFETY
            //
            // If events already use this venue,
            // increasing capacity is allowed.
            //
            // Decreasing capacity is blocked here to avoid
            // making existing event capacity invalid.
            // -------------------------------------------------

            if (
                request.TotalCapacity <
                    venue.TotalCapacity
            )
            {
                bool hasEvents =
                    await _venueRepository
                        .HasEventsAsync(
                            id
                        );


                if (hasEvents)
                {
                    throw new InvalidOperationException(
                        "Venue capacity cannot be reduced because events are already assigned to this venue."
                    );
                }
            }


            // -------------------------------------------------
            // UPDATE ENTITY
            // -------------------------------------------------

            venue.Name =
                venueName;


            venue.Address =
                address;


            venue.TotalCapacity =
                request.TotalCapacity;


            venue.UpdatedAt =
                DateTime.UtcNow;


            await _venueRepository
                .SaveChangesAsync();


            return MapToResponse(
                venue
            );
        }


        // =====================================================
        // DELETE VENUE
        // =====================================================

        public async Task DeleteAsync(
            int id
        )
        {
            if (id <= 0)
            {
                throw new ArgumentException(
                    "Invalid venue id."
                );
            }


            var venue =
                await _venueRepository
                    .GetByIdAsync(
                        id
                    );


            if (venue == null)
            {
                throw new KeyNotFoundException(
                    "Venue not found."
                );
            }


            // -------------------------------------------------
            // DO NOT DELETE VENUE USED BY EVENTS
            // -------------------------------------------------

            bool hasEvents =
                await _venueRepository
                    .HasEventsAsync(
                        id
                    );


            if (hasEvents)
            {
                throw new InvalidOperationException(
                    "This venue cannot be deleted because one or more events are assigned to it."
                );
            }


            _venueRepository.Delete(
                venue
            );


            await _venueRepository
                .SaveChangesAsync();
        }


        // =====================================================
        // ENTITY -> DTO
        // =====================================================

        private static VenueResponseDto MapToResponse(
            Venue venue
        )
        {
            return new VenueResponseDto
            {
                Id =
                    venue.Id,

                Name =
                    venue.Name,

                Address =
                    venue.Address,

                TotalCapacity =
                    venue.TotalCapacity,

                CreatedAt =
                    venue.CreatedAt,

                UpdatedAt =
                    venue.UpdatedAt
            };
        }
    }
}
