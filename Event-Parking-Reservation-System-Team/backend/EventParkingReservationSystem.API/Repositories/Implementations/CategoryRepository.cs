using EventParkingReservationSystem.API.Data;
using EventParkingReservationSystem.API.Models;
using EventParkingReservationSystem.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Implementations
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly ApplicationDbContext _context;


        public CategoryRepository(
            ApplicationDbContext context
        )
        {
            _context = context;
        }


        // =====================================================
        // GET ALL CATEGORIES
        // =====================================================

        public async Task<List<EventCategory>> GetAllAsync()
        {
            return await _context.EventCategories
                .AsNoTracking()
                .OrderBy(category => category.Name)
                .ToListAsync();
        }


        // =====================================================
        // GET CATEGORY BY ID
        // =====================================================

        public async Task<EventCategory?> GetByIdAsync(
            int id
        )
        {
            return await _context.EventCategories
                .FirstOrDefaultAsync(
                    category =>
                        category.Id == id
                );
        }


        // =====================================================
        // CHECK DUPLICATE CATEGORY NAME
        // =====================================================

        public async Task<bool> NameExistsAsync(
            string name,
            int? excludeCategoryId = null
        )
        {
            string normalizedName =
                name.Trim().ToLower();


            return await _context.EventCategories
                .AnyAsync(
                    category =>
                        category.Name.ToLower() == normalizedName
                        &&
                        (
                            excludeCategoryId == null
                            ||
                            category.Id != excludeCategoryId.Value
                        )
                );
        }


        // =====================================================
        // CHECK CATEGORY HAS EVENTS
        // =====================================================

        public async Task<bool> HasEventsAsync(
            int categoryId
        )
        {
            return await _context.Events
                .AnyAsync(
                    eventItem =>
                        eventItem.CategoryId == categoryId
                );
        }


        // =====================================================
        // ADD CATEGORY
        // =====================================================

        public async Task<EventCategory> AddAsync(
            EventCategory category
        )
        {
            await _context.EventCategories
                .AddAsync(
                    category
                );


            await _context.SaveChangesAsync();


            return category;
        }


        // =====================================================
        // DELETE CATEGORY
        // =====================================================

        public void Delete(
            EventCategory category
        )
        {
            _context.EventCategories
                .Remove(
                    category
                );
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
