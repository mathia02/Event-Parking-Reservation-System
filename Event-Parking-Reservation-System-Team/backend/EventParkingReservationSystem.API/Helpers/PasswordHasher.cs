using System.Security.Cryptography;

namespace EventParkingReservationSystem.API.Helpers
{
    public static class PasswordHasher
    {
        private const int SaltSize = 16;

        private const int HashSize = 32;

        private const int Iterations = 100000;


        // =====================================================
        // HASH PASSWORD
        // =====================================================

        public static string HashPassword(
            string password
        )
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                throw new ArgumentException(
                    "Password cannot be empty.",
                    nameof(password)
                );
            }


            byte[] salt =
                RandomNumberGenerator.GetBytes(
                    SaltSize
                );


            byte[] hash =
                Rfc2898DeriveBytes.Pbkdf2(
                    password,
                    salt,
                    Iterations,
                    HashAlgorithmName.SHA256,
                    HashSize
                );


            return string.Join(
                ".",
                Iterations,
                Convert.ToBase64String(salt),
                Convert.ToBase64String(hash)
            );
        }


        // =====================================================
        // VERIFY PASSWORD
        // =====================================================

        public static bool VerifyPassword(
            string password,
            string storedPasswordHash
        )
        {
            if (
                string.IsNullOrWhiteSpace(password) ||
                string.IsNullOrWhiteSpace(storedPasswordHash)
            )
            {
                return false;
            }


            try
            {
                string[] parts =
                    storedPasswordHash.Split('.');


                if (parts.Length != 3)
                {
                    return false;
                }


                if (!int.TryParse(
                    parts[0],
                    out int iterations
                ))
                {
                    return false;
                }


                byte[] salt =
                    Convert.FromBase64String(
                        parts[1]
                    );


                byte[] expectedHash =
                    Convert.FromBase64String(
                        parts[2]
                    );


                byte[] actualHash =
                    Rfc2898DeriveBytes.Pbkdf2(
                        password,
                        salt,
                        iterations,
                        HashAlgorithmName.SHA256,
                        expectedHash.Length
                    );


                return CryptographicOperations
                    .FixedTimeEquals(
                        actualHash,
                        expectedHash
                    );
            }
            catch
            {
                return false;
            }
        }
    }
}
