using EventParkingReservationSystem.API.DTOs.Events;
using EventParkingReservationSystem.API.Services.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly IEventService _eventService;


        public EventsController(
            IEventService eventService
        )
        {
            _eventService = eventService;
        }


        // =====================================================
        // GET ALL EVENTS
        // PUBLIC
        //
        // GET /api/Events
        // =====================================================

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var events =
                    await _eventService.GetAllAsync();


                return Ok(
                    events
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Get events error: {ex}"
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to load events."
                    }
                );
            }
        }


        // =====================================================
        // GET EVENT BY ID
        // PUBLIC
        //
        // GET /api/Events/1
        // =====================================================

        [AllowAnonymous]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(
            int id
        )
        {
            try
            {
                var eventItem =
                    await _eventService.GetByIdAsync(
                        id
                    );


                if (eventItem == null)
                {
                    return NotFound(
                        new
                        {
                            message =
                                "Event not found."
                        }
                    );
                }


                return Ok(
                    eventItem
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(
                    new
                    {
                        message =
                            ex.Message
                    }
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Get event error: {ex}"
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to load the event."
                    }
                );
            }
        }


        // =====================================================
        // CREATE EVENT
        // ADMIN ONLY
        //
        // POST /api/Events
        // =====================================================

        [Authorize(Roles = "Admin,Administrator")]
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateEventRequestDto request
        )
        {
            try
            {
                var eventItem =
                    await _eventService.CreateAsync(
                        request
                    );


                return CreatedAtAction(
                    nameof(GetById),
                    new
                    {
                        id = eventItem.Id
                    },
                    eventItem
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(
                    new
                    {
                        message =
                            ex.Message
                    }
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(
                    new
                    {
                        message =
                            ex.Message
                    }
                );
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(
                    new
                    {
                        message =
                            ex.Message
                    }
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Create event error: {ex}"
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to create the event."
                    }
                );
            }
        }


        // =====================================================
        // UPDATE EVENT
        // ADMIN ONLY
        //
        // PUT /api/Events/1
        // =====================================================

        [Authorize(Roles = "Admin,Administrator")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateEventRequestDto request
        )
        {
            try
            {
                var eventItem =
                    await _eventService.UpdateAsync(
                        id,
                        request
                    );


                return Ok(
                    eventItem
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(
                    new
                    {
                        message =
                            ex.Message
                    }
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(
                    new
                    {
                        message =
                            ex.Message
                    }
                );
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(
                    new
                    {
                        message =
                            ex.Message
                    }
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Update event error: {ex}"
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to update the event."
                    }
                );
            }
        }


        // =====================================================
        // DELETE EVENT
        // ADMIN ONLY
        //
        // DELETE /api/Events/1
        // =====================================================

        [Authorize(Roles = "Admin,Administrator")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(
            int id
        )
        {
            try
            {
                await _eventService.DeleteAsync(
                    id
                );


                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(
                    new
                    {
                        message =
                            ex.Message
                    }
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(
                    new
                    {
                        message =
                            ex.Message
                    }
                );
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(
                    new
                    {
                        message =
                            ex.Message
                    }
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Delete event error: {ex}"
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to delete the event."
                    }
                );
            }
        }
    }
}