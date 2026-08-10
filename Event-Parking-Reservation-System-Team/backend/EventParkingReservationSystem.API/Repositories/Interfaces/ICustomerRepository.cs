using EventParkingReservationSystem.API.Models;

namespace EventParkingReservationSystem.API.Repositories.Interfaces
{
    public interface ICustomerRepository
    {
        Task<bool> EmailExistsAsync(
            string email
        );


        Task<Customer?> GetByEmailAsync(
            string email
        );


        Task<Customer?> GetByIdAsync(
            int id
        );


        Task<Customer?> GetByVerificationTokenAsync(
            string token
        );


        Task<Customer?> GetByPasswordResetTokenAsync(
            string token
        );


        Task<Customer> AddAsync(
            Customer customer
        );


        Task SaveChangesAsync();
    }
}