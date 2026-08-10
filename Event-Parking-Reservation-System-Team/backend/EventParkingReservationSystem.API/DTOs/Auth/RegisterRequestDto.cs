using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.DTOs.Auth
{
    public class RegisterRequestDto
    {
        [Required(ErrorMessage = "First name is required.")]
        [StringLength(
            100,
            MinimumLength = 2,
            ErrorMessage = "First name must be between 2 and 100 characters."
        )]
        public string FirstName { get; set; } = string.Empty;


        [Required(ErrorMessage = "Last name is required.")]
        [StringLength(
            100,
            MinimumLength = 2,
            ErrorMessage = "Last name must be between 2 and 100 characters."
        )]
        public string LastName { get; set; } = string.Empty;


        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;


        [Phone(ErrorMessage = "Please enter a valid phone number.")]
        [StringLength(20)]
        public string? PhoneNumber { get; set; }


        [Required(ErrorMessage = "Password is required.")]
        [StringLength(
            100,
            MinimumLength = 8,
            ErrorMessage = "Password must contain at least 8 characters."
        )]
        public string Password { get; set; } = string.Empty;


        [Required(ErrorMessage = "Confirm password is required.")]
        [Compare(
            nameof(Password),
            ErrorMessage = "Password and confirm password do not match."
        )]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}