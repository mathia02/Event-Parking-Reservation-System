using EventParkingReservationSystem.API.DTOs.Venues;
using EventParkingReservationSystem.API.Services.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VenuesController : ControllerBase
    {
        private readonly IVenueService _venueService;


        public VenuesController(
            IVenueService venueService
        )
        {
            _venueService = venueService;
        }


        // =====================================================
        // GET ALL VENUES
        // Public
        // GET /api/Venues
        // =====================================================

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var venues =
                await _venueService.GetAllAsync();


            return Ok(
                venues
            );
        }


        // =====================================================
        // GET VENUE BY ID
        // Public
        // GET /api/Venues/1
        // =====================================================

        [AllowAnonymous]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(
            int id
        )
        {
            try
            {
                var venue =
                    await _venueService.GetByIdAsync(
                        id
                    );


                if (venue == null)
                {
                    return NotFound(
                        new
                        {
                            message =
                                "Venue not found."
                        }
                    );
                }


                return Ok(
                    venue
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
        }


        // =====================================================
        // GET AVAILABLE VENUES
        //
        // Example:
        // GET /api/Venues/available
        // ?eventDate=2026-09-20
        // &startTime=18:00:00
        // &endTime=22:00:00
        // =====================================================

        [AllowAnonymous]
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailable(
            [FromQuery] DateTime eventDate,
            [FromQuery] TimeSpan startTime,
            [FromQuery] TimeSpan endTime
        )
        {
            try
            {
                var venues =
                    await _venueService.GetAvailableAsync(
                        eventDate,
                        startTime,
                        endTime
                    );


                return Ok(
                    venues
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
        }


        // =====================================================
        // CREATE VENUE
        // ADMIN ONLY
        //
        // POST /api/Venues
        // =====================================================

        [Authorize(Roles = "Admin,Administrator")]
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateVenueRequestDto request
        )
        {
            try
            {
                var venue =
                    await _venueService.CreateAsync(
                        request
                    );


                return CreatedAtAction(
                    nameof(GetById),
                    new
                    {
                        id = venue.Id
                    },
                    venue
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
                    $"Create venue error: {ex}"
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to create the venue."
                    }
                );
            }
        }


        // =====================================================
        // UPDATE VENUE
        // ADMIN ONLY
        //
        // PUT /api/Venues/1
        // =====================================================

        [Authorize(Roles = "Admin,Administrator")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateVenueRequestDto request
        )
        {
            try
            {
                var venue =
                    await _venueService.UpdateAsync(
                        id,
                        request
                    );


                return Ok(
                    venue
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
                    $"Update venue error: {ex}"
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to update the venue."
                    }
                );
            }
        }


        // =====================================================
        // DELETE VENUE
        // ADMIN ONLY
        //
        // DELETE /api/Venues/1
        // =====================================================

        [Authorize(Roles = "Admin,Administrator")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(
            int id
        )
        {
            try
            {
                await _venueService.DeleteAsync(
                    id
                );


                return NoContent();
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
                    $"Delete venue error: {ex}"
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to delete the venue."
                    }
                );
            }
        }
    }
}
