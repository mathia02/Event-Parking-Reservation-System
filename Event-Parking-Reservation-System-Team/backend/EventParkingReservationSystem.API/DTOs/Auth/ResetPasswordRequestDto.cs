using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.DTOs.Auth
{
    public class ResetPasswordRequestDto
    {
        [Required(
            ErrorMessage = "Reset token is required."
        )]
        public string Token { get; set; }
            = string.Empty;


        [Required(
            ErrorMessage = "New password is required."
        )]
        [StringLength(
            100,
            MinimumLength = 8,
            ErrorMessage = "Password must contain at least 8 characters."
        )]
        public string NewPassword { get; set; }
            = string.Empty;


        [Required(
            ErrorMessage = "Confirm password is required."
        )]
        [Compare(
            nameof(NewPassword),
            ErrorMessage = "Password and confirm password do not match."
        )]
        public string ConfirmPassword { get; set; }
            = string.Empty;
    }
}