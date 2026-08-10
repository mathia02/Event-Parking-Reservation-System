using EventParkingReservationSystem.API.Data;
using EventParkingReservationSystem.API.Models;
using EventParkingReservationSystem.API.Repositories.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Implementations
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly ApplicationDbContext _context;


        public CustomerRepository(
            ApplicationDbContext context
        )
        {
            _context = context;
        }


        // =====================================================
        // EMAIL EXISTS
        // =====================================================

        public async Task<bool> EmailExistsAsync(
            string email
        )
        {
            string normalizedEmail =
                email.Trim()
                    .ToLowerInvariant();


            return await _context.Customers
                .AnyAsync(
                    customer =>
                        customer.Email.ToLower()
                        == normalizedEmail
                );
        }


        // =====================================================
        // GET BY EMAIL
        // =====================================================

        public async Task<Customer?> GetByEmailAsync(
            string email
        )
        {
            string normalizedEmail =
                email.Trim()
                    .ToLowerInvariant();


            return await _context.Customers
                .FirstOrDefaultAsync(
                    customer =>
                        customer.Email.ToLower()
                        == normalizedEmail
                );
        }


        // =====================================================
        // GET BY ID
        // =====================================================

        public async Task<Customer?> GetByIdAsync(
            int id
        )
        {
            return await _context.Customers
                .FirstOrDefaultAsync(
                    customer =>
                        customer.Id == id
                );
        }


        // =====================================================
        // GET BY VERIFICATION TOKEN
        // =====================================================

        public async Task<Customer?> GetByVerificationTokenAsync(
            string token
        )
        {
            return await _context.Customers
                .FirstOrDefaultAsync(
                    customer =>
                        customer.EmailVerificationToken
                        == token
                );
        }


        // =====================================================
        // GET BY PASSWORD RESET TOKEN
        // =====================================================

        public async Task<Customer?> GetByPasswordResetTokenAsync(
            string token
        )
        {
            return await _context.Customers
                .FirstOrDefaultAsync(
                    customer =>
                        customer.PasswordResetToken
                        == token
                );
        }


        // =====================================================
        // ADD CUSTOMER
        // =====================================================

        public async Task<Customer> AddAsync(
            Customer customer
        )
        {
            await _context.Customers.AddAsync(
                customer
            );


            await _context.SaveChangesAsync();


            return customer;
        }


        // =====================================================
        // SAVE CHANGES
        // =====================================================

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}