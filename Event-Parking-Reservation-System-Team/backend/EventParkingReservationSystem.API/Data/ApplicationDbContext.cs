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


        // =====================================================
        // VENUE
        // =====================================================

        public DbSet<Venue> Venues { get; set; } = null!;


        // =====================================================
        // CATEGORY
        // =====================================================

        public DbSet<EventCategory> EventCategories { get; set; } = null!;


        // =====================================================
        // EVENT
        // =====================================================

        public DbSet<Event> Events { get; set; } = null!;


        // =====================================================
        // CUSTOMER
        // =====================================================

        public DbSet<Customer> Customers { get; set; } = null!;


        // =====================================================
        // SEAT
        // =====================================================

        public DbSet<Seat> Seats { get; set; } = null!;


        // =====================================================
        // MODEL CONFIGURATION
        // =====================================================

        protected override void OnModelCreating(
            ModelBuilder modelBuilder
        )
        {
            base.OnModelCreating(
                modelBuilder
            );


            // =================================================
            // EVENT
            // =================================================

            modelBuilder.Entity<Event>(
                entity =>
                {
                    entity.Property(
                        eventItem =>
                            eventItem.TicketPrice
                    )
                    .HasPrecision(
                        18,
                        2
                    );
                }
            );


            // =================================================
            // SEAT
            // =================================================

            modelBuilder.Entity<Seat>(
                entity =>
                {
                    // -----------------------------------------
                    // Primary Key
                    // -----------------------------------------

                    entity.HasKey(
                        seat =>
                            seat.Id
                    );


                    // -----------------------------------------
                    // Seat Number
                    //
                    // Example:
                    // A1, A2, B1
                    // -----------------------------------------

                    entity.Property(
                        seat =>
                            seat.SeatNumber
                    )
                    .IsRequired()
                    .HasMaxLength(
                        20
                    );


                    // -----------------------------------------
                    // Row Label
                    //
                    // Example:
                    // A, B, C
                    // -----------------------------------------

                    entity.Property(
                        seat =>
                            seat.RowLabel
                    )
                    .IsRequired()
                    .HasMaxLength(
                        10
                    );


                    // -----------------------------------------
                    // Price Override
                    // -----------------------------------------

                    entity.Property(
                        seat =>
                            seat.PriceOverride
                    )
                    .HasPrecision(
                        18,
                        2
                    );


                    // -----------------------------------------
                    // EVENT RELATIONSHIP
                    // -----------------------------------------

                    entity.HasOne(
                        seat =>
                            seat.Event
                    )
                    .WithMany()
                    .HasForeignKey(
                        seat =>
                            seat.EventId
                    )
                    .OnDelete(
                        DeleteBehavior.Cascade
                    );


                    // -----------------------------------------
                    // UNIQUE SEAT NUMBER PER EVENT
                    //
                    // Event 1 → A1 allowed
                    // Event 1 → A1 again blocked
                    // Event 2 → A1 allowed
                    // -----------------------------------------

                    entity.HasIndex(
                        seat =>
                            new
                            {
                                seat.EventId,
                                seat.SeatNumber
                            }
                    )
                    .IsUnique();


                    // -----------------------------------------
                    // UNIQUE ROW + COLUMN PER EVENT
                    //
                    // Event 1
                    // Row A + Column 1 only once
                    // -----------------------------------------

                    entity.HasIndex(
                        seat =>
                            new
                            {
                                seat.EventId,
                                seat.RowLabel,
                                seat.ColumnNumber
                            }
                    )
                    .IsUnique();
                }
            );
        }
    }
}