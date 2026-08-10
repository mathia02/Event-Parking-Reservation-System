using EventParkingReservationSystem.API.Enums;
using EventParkingReservationSystem.API.Helpers;
using EventParkingReservationSystem.API.Models;

using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Data
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(
            WebApplication app
        )
        {
            using var scope =
                app.Services.CreateScope();


            var context =
                scope.ServiceProvider
                    .GetRequiredService<ApplicationDbContext>();


            // ======================================================
            // ADMIN USER
            // ======================================================

            const string adminEmail =
                "admin@eventpark.local";


            var admin =
                await context.Customers
                    .FirstOrDefaultAsync(
                        customer =>
                            customer.Email == adminEmail
                    );


            if (admin == null)
            {
                admin =
                    new Customer
                    {
                        FirstName =
                            "System",

                        LastName =
                            "Administrator",

                        Email =
                            adminEmail,

                        PhoneNumber =
                            "0770000000",

                        PasswordHash =
                            PasswordHasher.HashPassword(
                                "Admin@123"
                            ),

                        Role =
                            "Admin",

                        Status =
                            CustomerStatus.Active,

                        IsEmailVerified =
                            true,

                        EmailVerificationToken =
                            null,

                        EmailVerificationTokenExpiresAt =
                            null,

                        PasswordResetToken =
                            null,

                        PasswordResetTokenExpiresAt =
                            null,

                        CreatedAt =
                            DateTime.UtcNow
                    };


                await context.Customers.AddAsync(
                    admin
                );


                await context.SaveChangesAsync();
            }


            // ======================================================
            // VENUE
            // ======================================================

            var venue =
                await context.Venues
                    .FirstOrDefaultAsync(
                        venue =>
                            venue.Name ==
                            "Vavuniya Cultural Hall"
                    );


            if (venue == null)
            {
                venue =
                    new Venue
                    {
                        Name =
                            "Vavuniya Cultural Hall",

                        Address =
                            "Vavuniya, Sri Lanka",

                        TotalCapacity =
                            500,

                        CreatedAt =
                            DateTime.UtcNow
                    };


                context.Venues.Add(
                    venue
                );


                await context.SaveChangesAsync();
            }


            // ======================================================
            // CATEGORY
            // ======================================================

            var category =
                await context.EventCategories
                    .FirstOrDefaultAsync(
                        category =>
                            category.Name ==
                            "Concert"
                    );


            if (category == null)
            {
                category =
                    new EventCategory
                    {
                        Name =
                            "Concert",

                        Description =
                            "Music and live entertainment events",

                        CreatedAt =
                            DateTime.UtcNow
                    };


                context.EventCategories.Add(
                    category
                );


                await context.SaveChangesAsync();
            }


            // ======================================================
            // EVENT
            // ======================================================

            var existingEvent =
                await context.Events
                    .FirstOrDefaultAsync(
                        existingEvent =>
                            existingEvent.Name ==
                            "Music Festival"
                    );


            if (existingEvent == null)
            {
                var newEvent =
                    new Event
                    {
                        Name =
                            "Music Festival",

                        ImageUrl =
                            "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",

                        VenueId =
                            venue.Id,

                        CategoryId =
                            category.Id,

                        EventDate =
                            DateTime.Today.AddDays(30),

                        StartTime =
                            new TimeSpan(
                                18,
                                0,
                                0
                            ),

                        EndTime =
                            new TimeSpan(
                                22,
                                0,
                                0
                            ),

                        TicketPrice =
                            2500.00m,

                        Capacity =
                            300,

                        CreatedAt =
                            DateTime.UtcNow
                    };


                context.Events.Add(
                    newEvent
                );


                await context.SaveChangesAsync();
            }
            else
            {
                existingEvent.ImageUrl =
                    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80";


                existingEvent.UpdatedAt =
                    DateTime.UtcNow;


                await context.SaveChangesAsync();
            }
        }
    }
}