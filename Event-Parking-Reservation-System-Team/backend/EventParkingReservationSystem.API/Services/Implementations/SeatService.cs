using EventParkingReservationSystem.API.DTOs.Seats;
using EventParkingReservationSystem.API.Enums;
using EventParkingReservationSystem.API.Models;
using EventParkingReservationSystem.API.Repositories.Interfaces;
using EventParkingReservationSystem.API.Services.Interfaces;

namespace EventParkingReservationSystem.API.Services.Implementations
{
    public class SeatService : ISeatService
    {
        private readonly ISeatRepository _seatRepository;

        private readonly IEventRepository _eventRepository;


        public SeatService(
            ISeatRepository seatRepository,
            IEventRepository eventRepository
        )
        {
            _seatRepository =
                seatRepository;


            _eventRepository =
                eventRepository;
        }


        // =====================================================
        // GET EVENT SEAT MAP
        //
        // GET seats belonging to an Event.
        //
        // Effective Price:
        // PriceOverride ?? Event.TicketPrice
        // =====================================================

        public async Task<List<SeatResponseDto>> GetByEventIdAsync(
            int eventId
        )
        {
            if (eventId <= 0)
            {
                throw new ArgumentException(
                    "Invalid event ID."
                );
            }


            var eventItem =
                await _eventRepository.GetByIdAsync(
                    eventId
                );


            if (eventItem == null)
            {
                throw new KeyNotFoundException(
                    "Event not found."
                );
            }


            var seats =
                await _seatRepository.GetByEventIdAsync(
                    eventId
                );


            return seats
                .Select(
                    seat =>
                        MapToResponse(
                            seat,
                            eventItem.TicketPrice
                        )
                )
                .ToList();
        }


        // =====================================================
        // GENERATE SEATS
        //
        // Example:
        //
        // Event Capacity = 12
        //
        // Rows = 3
        // SeatsPerRow = 4
        //
        // 3 × 4 = 12 ✅
        //
        // Generated:
        //
        // A1 A2 A3 A4
        // B1 B2 B3 B4
        // C1 C2 C3 C4
        // =====================================================

        public async Task<List<SeatResponseDto>> GenerateSeatsAsync(
            int eventId,
            GenerateSeatsRequestDto request
        )
        {
            // -------------------------------------------------
            // EVENT ID
            // -------------------------------------------------

            if (eventId <= 0)
            {
                throw new ArgumentException(
                    "Invalid event ID."
                );
            }


            // -------------------------------------------------
            // FIND EVENT
            // -------------------------------------------------

            var eventItem =
                await _eventRepository.GetByIdAsync(
                    eventId
                );


            if (eventItem == null)
            {
                throw new KeyNotFoundException(
                    "Event not found."
                );
            }


            // -------------------------------------------------
            // VALIDATE ROWS
            // -------------------------------------------------

            if (request.Rows <= 0)
            {
                throw new ArgumentException(
                    "Rows must be greater than zero."
                );
            }


            // -------------------------------------------------
            // VALIDATE SEATS PER ROW
            // -------------------------------------------------

            if (request.SeatsPerRow <= 0)
            {
                throw new ArgumentException(
                    "Seats per row must be greater than zero."
                );
            }


            // -------------------------------------------------
            // EXACT CAPACITY RULE
            //
            // Generated seat count MUST equal
            // Event Capacity.
            // -------------------------------------------------

            int requestedSeatCount =
                request.Rows *
                request.SeatsPerRow;


            if (
                requestedSeatCount !=
                eventItem.Capacity
            )
            {
                throw new InvalidOperationException(
                    $"Seat layout must contain exactly {eventItem.Capacity} seats. " +
                    $"The requested layout creates {requestedSeatCount} seats."
                );
            }


            // -------------------------------------------------
            // DO NOT GENERATE TWICE
            // -------------------------------------------------

            bool alreadyHasSeats =
                await _seatRepository.HasSeatsAsync(
                    eventId
                );


            if (alreadyHasSeats)
            {
                throw new InvalidOperationException(
                    "Seats have already been generated for this event."
                );
            }


            // -------------------------------------------------
            // GENERATE
            // -------------------------------------------------

            var seats =
                new List<Seat>();


            for (
                int rowIndex = 0;
                rowIndex < request.Rows;
                rowIndex++
            )
            {
                string rowLabel =
                    GetRowLabel(
                        rowIndex
                    );


                for (
                    int columnNumber = 1;
                    columnNumber <= request.SeatsPerRow;
                    columnNumber++
                )
                {
                    string seatNumber =
                        $"{rowLabel}{columnNumber}";


                    var seat =
                        new Seat
                        {
                            EventId =
                                eventId,

                            SeatNumber =
                                seatNumber,

                            RowLabel =
                                rowLabel,

                            ColumnNumber =
                                columnNumber,

                            PriceOverride =
                                null,

                            Status =
                                SeatStatus.Available,

                            CreatedAt =
                                DateTime.UtcNow
                        };


                    seats.Add(
                        seat
                    );
                }
            }


            // -------------------------------------------------
            // SAFETY CHECK
            // -------------------------------------------------

            if (
                seats.Count !=
                eventItem.Capacity
            )
            {
                throw new InvalidOperationException(
                    "Generated seat count does not match the event capacity."
                );
            }


            // -------------------------------------------------
            // SAVE
            // -------------------------------------------------

            await _seatRepository.AddRangeAsync(
                seats
            );


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return seats
                .Select(
                    seat =>
                        MapToResponse(
                            seat,
                            eventItem.TicketPrice
                        )
                )
                .ToList();
        }


        // =====================================================
        // UPDATE ROW PRICE
        //
        // Example:
        //
        // Event TicketPrice = Rs. 2500
        //
        // Row A PriceOverride = 3500
        //
        // A1 EffectivePrice = 3500
        // A2 EffectivePrice = 3500
        //
        // If any Seat in Row A is:
        //
        // Held / Booked
        //
        // Price update BLOCKED.
        // =====================================================

        public async Task<List<SeatResponseDto>> UpdateRowPriceAsync(
            int eventId,
            UpdateRowPriceRequestDto request
        )
        {
            // -------------------------------------------------
            // EVENT
            // -------------------------------------------------

            if (eventId <= 0)
            {
                throw new ArgumentException(
                    "Invalid event ID."
                );
            }


            var eventItem =
                await _eventRepository.GetByIdAsync(
                    eventId
                );


            if (eventItem == null)
            {
                throw new KeyNotFoundException(
                    "Event not found."
                );
            }


            // -------------------------------------------------
            // ROW LABEL
            // -------------------------------------------------

            if (
                string.IsNullOrWhiteSpace(
                    request.RowLabel
                )
            )
            {
                throw new ArgumentException(
                    "Row label is required."
                );
            }


            string rowLabel =
                request.RowLabel
                    .Trim()
                    .ToUpperInvariant();


            // -------------------------------------------------
            // PRICE
            // -------------------------------------------------

            if (
                request.PriceOverride.HasValue
                &&
                request.PriceOverride.Value < 0
            )
            {
                throw new ArgumentException(
                    "Price override cannot be negative."
                );
            }


            // -------------------------------------------------
            // FIND ROW
            // -------------------------------------------------

            var rowSeats =
                await _seatRepository.GetByRowAsync(
                    eventId,
                    rowLabel
                );


            if (
                rowSeats.Count == 0
            )
            {
                throw new KeyNotFoundException(
                    $"Row {rowLabel} was not found for this event."
                );
            }


            // -------------------------------------------------
            // HELD / BOOKED PROTECTION
            // -------------------------------------------------

            bool rowLocked =
                await _seatRepository
                    .HasHeldOrBookedSeatsInRowAsync(
                        eventId,
                        rowLabel
                    );


            if (rowLocked)
            {
                throw new InvalidOperationException(
                    $"Row {rowLabel} price cannot be changed because one or more seats are currently held or booked."
                );
            }


            // -------------------------------------------------
            // UPDATE ALL SEATS IN ROW
            // -------------------------------------------------

            foreach (
                var seat in rowSeats
            )
            {
                seat.PriceOverride =
                    request.PriceOverride;


                seat.UpdatedAt =
                    DateTime.UtcNow;
            }


            await _seatRepository.SaveChangesAsync();


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return rowSeats
                .Select(
                    seat =>
                        MapToResponse(
                            seat,
                            eventItem.TicketPrice
                        )
                )
                .ToList();
        }


        // =====================================================
        // UPDATE SEAT STATUS
        //
        // Allowed:
        //
        // Available
        // Held
        // Booked
        // Unavailable
        //
        // Selected is NOT allowed.
        // =====================================================

        public async Task<SeatResponseDto> UpdateSeatStatusAsync(
            int seatId,
            UpdateSeatStatusRequestDto request
        )
        {
            // -------------------------------------------------
            // SEAT ID
            // -------------------------------------------------

            if (seatId <= 0)
            {
                throw new ArgumentException(
                    "Invalid seat ID."
                );
            }


            // -------------------------------------------------
            // STATUS REQUIRED
            // -------------------------------------------------

            if (
                string.IsNullOrWhiteSpace(
                    request.Status
                )
            )
            {
                throw new ArgumentException(
                    "Seat status is required."
                );
            }


            // -------------------------------------------------
            // PARSE ENUM
            // -------------------------------------------------

            bool parsed =
                Enum.TryParse<SeatStatus>(
                    request.Status.Trim(),
                    true,
                    out var newStatus
                );


            if (!parsed)
            {
                throw new ArgumentException(
                    "Invalid seat status. Allowed values are Available, Held, Booked and Unavailable."
                );
            }


            // -------------------------------------------------
            // ENSURE ONLY DEFINED ENUM
            // -------------------------------------------------

            if (
                !Enum.IsDefined(
                    typeof(SeatStatus),
                    newStatus
                )
            )
            {
                throw new ArgumentException(
                    "Invalid seat status. Allowed values are Available, Held, Booked and Unavailable."
                );
            }


            // -------------------------------------------------
            // FIND SEAT
            // -------------------------------------------------

            var seat =
                await _seatRepository.GetByIdAsync(
                    seatId
                );


            if (seat == null)
            {
                throw new KeyNotFoundException(
                    "Seat not found."
                );
            }


            // -------------------------------------------------
            // UPDATE
            // -------------------------------------------------

            seat.Status =
                newStatus;


            seat.UpdatedAt =
                DateTime.UtcNow;


            await _seatRepository.SaveChangesAsync();


            // -------------------------------------------------
            // EVENT PRICE
            // -------------------------------------------------

            decimal eventTicketPrice =
                seat.Event?.TicketPrice ??
                0m;


            return MapToResponse(
                seat,
                eventTicketPrice
            );
        }


        // =====================================================
        // ROW LABEL GENERATOR
        //
        // 0  = A
        // 1  = B
        // ...
        // 25 = Z
        // 26 = AA
        // 27 = AB
        //
        // This supports more than 26 rows.
        // =====================================================

        private static string GetRowLabel(
            int rowIndex
        )
        {
            if (rowIndex < 0)
            {
                throw new ArgumentException(
                    "Invalid row index."
                );
            }


            int value =
                rowIndex + 1;


            string label =
                string.Empty;


            while (value > 0)
            {
                value--;


                int remainder =
                    value % 26;


                char letter =
                    (char)(
                        'A' +
                        remainder
                    );


                label =
                    letter +
                    label;


                value /=
                    26;
            }


            return label;
        }


        // =====================================================
        // MAP SEAT RESPONSE
        //
        // Effective Price:
        //
        // PriceOverride ?? Event.TicketPrice
        // =====================================================

        private static SeatResponseDto MapToResponse(
            Seat seat,
            decimal eventTicketPrice
        )
        {
            decimal effectivePrice =
                seat.PriceOverride
                ??
                eventTicketPrice;


            return new SeatResponseDto
            {
                Id =
                    seat.Id,

                EventId =
                    seat.EventId,

                SeatNumber =
                    seat.SeatNumber,

                RowLabel =
                    seat.RowLabel,

                ColumnNumber =
                    seat.ColumnNumber,

                PriceOverride =
                    seat.PriceOverride,

                EffectivePrice =
                    effectivePrice,

                Status =
                    seat.Status.ToString()
            };
        }
    }
}
