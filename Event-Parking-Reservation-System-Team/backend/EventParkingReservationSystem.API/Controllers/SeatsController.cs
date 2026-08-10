using EventParkingReservationSystem.API.DTOs.Seats;
using EventParkingReservationSystem.API.Services.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers
{
    [ApiController]
    [Route("api")]
    public class SeatsController : ControllerBase
    {
        private readonly ISeatService _seatService;


        public SeatsController(
            ISeatService seatService
        )
        {
            _seatService = seatService;
        }


        // =====================================================
        // GET EVENT SEAT MAP
        // PUBLIC
        //
        // GET /api/events/1/seats
        // =====================================================

        [AllowAnonymous]
        [HttpGet("events/{eventId:int}/seats")]
        public async Task<IActionResult> GetEventSeats(
            int eventId
        )
        {
            try
            {
                var seats =
                    await _seatService.GetByEventIdAsync(
                        eventId
                    );


                return Ok(
                    seats
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(
                    new
                    {
                        message = ex.Message
                    }
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(
                    new
                    {
                        message = ex.Message
                    }
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Get event seats error: {ex}"
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to load the event seat map."
                    }
                );
            }
        }


        // =====================================================
        // GENERATE EVENT SEATS
        // ADMIN ONLY
        //
        // POST /api/events/1/seats/generate
        //
        // Body:
        // {
        //   "rows": 3,
        //   "seatsPerRow": 4
        // }
        // =====================================================

        [Authorize(Roles = "Admin,Administrator")]
        [HttpPost("events/{eventId:int}/seats/generate")]
        public async Task<IActionResult> GenerateSeats(
            int eventId,
            [FromBody] GenerateSeatsRequestDto request
        )
        {
            try
            {
                var seats =
                    await _seatService.GenerateSeatsAsync(
                        eventId,
                        request
                    );


                return StatusCode(
                    StatusCodes.Status201Created,
                    seats
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(
                    new
                    {
                        message = ex.Message
                    }
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(
                    new
                    {
                        message = ex.Message
                    }
                );
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(
                    new
                    {
                        message = ex.Message
                    }
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Generate seats error: {ex}"
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to generate seats for this event."
                    }
                );
            }
        }


        // =====================================================
        // UPDATE ROW PRICE
        // ADMIN ONLY
        //
        // PUT /api/events/1/seats/row-price
        //
        // Example:
        // {
        //   "rowLabel": "A",
        //   "priceOverride": 3500
        // }
        //
        // Reset override:
        // {
        //   "rowLabel": "A",
        //   "priceOverride": null
        // }
        // =====================================================

        [Authorize(Roles = "Admin,Administrator")]
        [HttpPut("events/{eventId:int}/seats/row-price")]
        public async Task<IActionResult> UpdateRowPrice(
            int eventId,
            [FromBody] UpdateRowPriceRequestDto request
        )
        {
            try
            {
                var seats =
                    await _seatService.UpdateRowPriceAsync(
                        eventId,
                        request
                    );


                return Ok(
                    seats
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(
                    new
                    {
                        message = ex.Message
                    }
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(
                    new
                    {
                        message = ex.Message
                    }
                );
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(
                    new
                    {
                        message = ex.Message
                    }
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Update row price error: {ex}"
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to update the row price."
                    }
                );
            }
        }


        // =====================================================
        // UPDATE INDIVIDUAL SEAT STATUS
        // ADMIN ONLY
        //
        // PUT /api/seats/10/status
        //
        // Body:
        // {
        //   "status": "Unavailable"
        // }
        //
        // Allowed:
        // Available
        // Held
        // Booked
        // Unavailable
        // =====================================================

        [Authorize(Roles = "Admin,Administrator")]
        [HttpPut("seats/{seatId:int}/status")]
        public async Task<IActionResult> UpdateSeatStatus(
            int seatId,
            [FromBody] UpdateSeatStatusRequestDto request
        )
        {
            try
            {
                var seat =
                    await _seatService.UpdateSeatStatusAsync(
                        seatId,
                        request
                    );


                return Ok(
                    seat
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(
                    new
                    {
                        message = ex.Message
                    }
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(
                    new
                    {
                        message = ex.Message
                    }
                );
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(
                    new
                    {
                        message = ex.Message
                    }
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Update seat status error: {ex}"
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to update the seat status."
                    }
                );
            }
        }
    }
}
