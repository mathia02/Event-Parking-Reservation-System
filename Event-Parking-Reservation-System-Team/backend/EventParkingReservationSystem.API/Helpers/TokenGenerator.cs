using System.Security.Cryptography;

namespace EventParkingReservationSystem.API.Helpers
{
    public static class TokenGenerator
    {
        // =====================================================
        // SECURE TOKEN
        // =====================================================

        public static string GenerateToken()
        {
            byte[] tokenBytes =
                RandomNumberGenerator.GetBytes(
                    32
                );


            return Convert
                .ToHexString(tokenBytes)
                .ToLowerInvariant();
        }
    }
}
