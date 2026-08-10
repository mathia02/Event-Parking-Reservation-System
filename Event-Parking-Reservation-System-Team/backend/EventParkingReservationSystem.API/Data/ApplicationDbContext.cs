using EventParkingReservationSystem.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options
        ) : base(options)
        {
        }


        // ======================================================
        // VENUES
        // ======================================================

        public DbSet<Venue> Venues { get; set; }
            = null!;


        // ======================================================
        // EVENT CATEGORIES
        // ======================================================

        public DbSet<EventCategory> EventCategories { get; set; }
            = null!;


        // ======================================================
        // EVENTS
        // ======================================================

        public DbSet<Event> Events { get; set; }
            = null!;


        // ======================================================
        // CUSTOMERS
        // ======================================================

        public DbSet<Customer> Customers { get; set; }
            = null!;
    }
}