using EventParkingReservationSystem.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.Models
{
    public class Customer
    {
        public int Id { get; set; }


        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;


        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;


        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;


        [Required]
        public string PasswordHash { get; set; } = string.Empty;


        [MaxLength(20)]
        public string? PhoneNumber { get; set; }


        // Customer / Admin
        [Required]
        [MaxLength(30)]
        public string Role { get; set; } = "Customer";


        public CustomerStatus Status { get; set; }
            = CustomerStatus.PendingVerification;


        public bool IsEmailVerified { get; set; }
            = false;


        // =====================================================
        // EMAIL VERIFICATION
        // =====================================================

        public string? EmailVerificationToken { get; set; }

        public DateTime? EmailVerificationTokenExpiresAt { get; set; }


        // =====================================================
        // FORGOT / RESET PASSWORD
        // =====================================================

        public string? PasswordResetToken { get; set; }

        public DateTime? PasswordResetTokenExpiresAt { get; set; }


        // =====================================================
        // AUDIT
        // =====================================================

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;


        public DateTime? UpdatedAt { get; set; }


        public DateTime? LastLoginAt { get; set; }
    }
}
