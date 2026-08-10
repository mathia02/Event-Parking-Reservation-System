using EventParkingReservationSystem.API.DTOs.Auth;
using EventParkingReservationSystem.API.Services.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using System.Security.Claims;

namespace EventParkingReservationSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;


        public AuthController(
            IAuthService authService
        )
        {
            _authService = authService;
        }


        // =====================================================
        // REGISTER
        // =====================================================

        [HttpPost("register")]
        public async Task<IActionResult> Register(
            [FromBody] RegisterRequestDto request
        )
        {
            try
            {
                var result =
                    await _authService.RegisterAsync(
                        request
                    );


                return StatusCode(
                    StatusCodes.Status201Created,
                    result
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
                    "REGISTER ERROR:"
                );

                Console.WriteLine(
                    ex.ToString()
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An unexpected error occurred while creating the account."
                    }
                );
            }
        }


        // =====================================================
        // VERIFY EMAIL
        // =====================================================

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail(
            [FromBody] VerifyEmailRequestDto request
        )
        {
            try
            {
                var message =
                    await _authService.VerifyEmailAsync(
                        request.Token
                    );


                return Ok(
                    new
                    {
                        message
                    }
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
            catch (InvalidOperationException ex)
            {
                return BadRequest(
                    new
                    {
                        message = ex.Message
                    }
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "VERIFY EMAIL ERROR:"
                );

                Console.WriteLine(
                    ex.ToString()
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An unexpected error occurred while verifying the email."
                    }
                );
            }
        }


        // =====================================================
        // RESEND VERIFICATION
        // =====================================================

        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerification(
            [FromBody] ResendVerificationRequestDto request
        )
        {
            try
            {
                var message =
                    await _authService.ResendVerificationAsync(
                        request
                    );


                return Ok(
                    new
                    {
                        message
                    }
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "RESEND VERIFICATION ERROR:"
                );

                Console.WriteLine(
                    ex.ToString()
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to resend the verification email."
                    }
                );
            }
        }


        // =====================================================
        // FORGOT PASSWORD
        // =====================================================

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(
            [FromBody] ForgotPasswordRequestDto request
        )
        {
            try
            {
                var message =
                    await _authService.ForgotPasswordAsync(
                        request
                    );

                return Ok(
                    new
                    {
                        message
                    }
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Forgot password error: {ex}"
                );

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to process the password reset request."
                    }
                );
            }
        }

        // =====================================================
        // RESET PASSWORD
        // =====================================================

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(
            [FromBody] ResetPasswordRequestDto request
        )
        {
            try
            {
                var message =
                    await _authService.ResetPasswordAsync(
                        request
                    );


                return Ok(
                    new
                    {
                        message
                    }
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
            catch (InvalidOperationException ex)
            {
                return BadRequest(
                    new
                    {
                        message = ex.Message
                    }
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "RESET PASSWORD ERROR:"
                );

                Console.WriteLine(
                    ex.ToString()
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "Unable to reset the password."
                    }
                );
            }
        }


        // =====================================================
        // LOGIN
        // =====================================================

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] LoginRequestDto request
        )
        {
            try
            {
                var result =
                    await _authService.LoginAsync(
                        request
                    );


                return Ok(
                    result
                );
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(
                    new
                    {
                        message = ex.Message
                    }
                );
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(
                    new
                    {
                        message = ex.Message
                    }
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "LOGIN ERROR:"
                );

                Console.WriteLine(
                    ex.ToString()
                );


                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new
                    {
                        message =
                            "An unexpected error occurred while logging in."
                    }
                );
            }
        }


        // =====================================================
        // CURRENT USER
        // =====================================================

        [Authorize]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            var customerId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );


            var email =
                User.FindFirstValue(
                    ClaimTypes.Email
                );


            var firstName =
                User.FindFirstValue(
                    ClaimTypes.GivenName
                );


            var lastName =
                User.FindFirstValue(
                    ClaimTypes.Surname
                );


            var role =
                User.FindFirstValue(
                    ClaimTypes.Role
                );


            return Ok(
                new
                {
                    customerId,
                    firstName,
                    lastName,
                    email,
                    role
                }
            );
        }
    }
}