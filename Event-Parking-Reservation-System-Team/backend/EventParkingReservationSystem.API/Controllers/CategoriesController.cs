using EventParkingReservationSystem.API.DTOs.Categories;
using EventParkingReservationSystem.API.Services.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;


        public CategoriesController(
            ICategoryService categoryService
        )
        {
            _categoryService = categoryService;
        }


        // =====================================================
        // GET ALL CATEGORIES
        // PUBLIC
        //
        // GET /api/Categories
        // =====================================================

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories =
                await _categoryService.GetAllAsync();


            return Ok(
                categories
            );
        }


        // =====================================================
        // GET CATEGORY BY ID
        // PUBLIC
        //
        // GET /api/Categories/1
        // =====================================================

        [AllowAnonymous]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(
            int id
        )
        {
            try
            {
                var category =
                    await _categoryService.GetByIdAsync(
                        id
                    );


                if (category == null)
                {
                    return NotFound(
                        new
                        {
                            message =
                                "Category not found."
                        }
                    );
                }


                return Ok(
                    category
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
        // CREATE CATEGORY
        // ADMIN ONLY
        //
        // POST /api/Categories
        // =====================================================

        [Authorize(Roles = "Admin,Administrator")]
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateCategoryRequestDto request
        )
        {
            try
            {
                var category =
                    await _categoryService.CreateAsync(
                        request
                    );


                return CreatedAtAction(
                    nameof(GetById),
                    new
                    {
                        id = category.Id
                    },
                    category
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
                    $"Create category error: {ex}"
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to create the category."
                    }
                );
            }
        }


        // =====================================================
        // UPDATE CATEGORY
        // ADMIN ONLY
        //
        // PUT /api/Categories/1
        // =====================================================

        [Authorize(Roles = "Admin,Administrator")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateCategoryRequestDto request
        )
        {
            try
            {
                var category =
                    await _categoryService.UpdateAsync(
                        id,
                        request
                    );


                return Ok(
                    category
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
                    $"Update category error: {ex}"
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to update the category."
                    }
                );
            }
        }


        // =====================================================
        // DELETE CATEGORY
        // ADMIN ONLY
        //
        // DELETE /api/Categories/1
        // =====================================================

        [Authorize(Roles = "Admin,Administrator")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(
            int id
        )
        {
            try
            {
                await _categoryService.DeleteAsync(
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
                    $"Delete category error: {ex}"
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to delete the category."
                    }
                );
            }
        }
    }
}
