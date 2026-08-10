using EventParkingReservationSystem.API.DTOs.Categories;
using EventParkingReservationSystem.API.Models;
using EventParkingReservationSystem.API.Repositories.Interfaces;
using EventParkingReservationSystem.API.Services.Interfaces;

namespace EventParkingReservationSystem.API.Services.Implementations
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;


        public CategoryService(
            ICategoryRepository categoryRepository
        )
        {
            _categoryRepository = categoryRepository;
        }


        // =====================================================
        // GET ALL CATEGORIES
        // =====================================================

        public async Task<List<CategoryResponseDto>> GetAllAsync()
        {
            var categories =
                await _categoryRepository.GetAllAsync();


            return categories
                .Select(MapToResponse)
                .ToList();
        }


        // =====================================================
        // GET CATEGORY BY ID
        // =====================================================

        public async Task<CategoryResponseDto?> GetByIdAsync(
            int id
        )
        {
            if (id <= 0)
            {
                throw new ArgumentException(
                    "Invalid category ID."
                );
            }


            var category =
                await _categoryRepository.GetByIdAsync(
                    id
                );


            if (category == null)
            {
                return null;
            }


            return MapToResponse(
                category
            );
        }


        // =====================================================
        // CREATE CATEGORY
        // =====================================================

        public async Task<CategoryResponseDto> CreateAsync(
            CreateCategoryRequestDto request
        )
        {
            string categoryName =
                request.Name.Trim();


            bool categoryExists =
                await _categoryRepository.NameExistsAsync(
                    categoryName
                );


            if (categoryExists)
            {
                throw new InvalidOperationException(
                    "A category with this name already exists."
                );
            }


            var category =
                new EventCategory
                {
                    Name =
                        categoryName,

                    Description =
                        string.IsNullOrWhiteSpace(
                            request.Description
                        )
                            ? null
                            : request.Description.Trim(),

                    CreatedAt =
                        DateTime.UtcNow
                };


            await _categoryRepository.AddAsync(
                category
            );


            return MapToResponse(
                category
            );
        }


        // =====================================================
        // UPDATE CATEGORY
        // =====================================================

        public async Task<CategoryResponseDto> UpdateAsync(
            int id,
            UpdateCategoryRequestDto request
        )
        {
            if (id <= 0)
            {
                throw new ArgumentException(
                    "Invalid category ID."
                );
            }


            var category =
                await _categoryRepository.GetByIdAsync(
                    id
                );


            if (category == null)
            {
                throw new KeyNotFoundException(
                    "Category not found."
                );
            }


            string categoryName =
                request.Name.Trim();


            bool duplicateExists =
                await _categoryRepository.NameExistsAsync(
                    categoryName,
                    id
                );


            if (duplicateExists)
            {
                throw new InvalidOperationException(
                    "A category with this name already exists."
                );
            }


            category.Name =
                categoryName;


            category.Description =
                string.IsNullOrWhiteSpace(
                    request.Description
                )
                    ? null
                    : request.Description.Trim();


            category.UpdatedAt =
                DateTime.UtcNow;


            await _categoryRepository.SaveChangesAsync();


            return MapToResponse(
                category
            );
        }


        // =====================================================
        // DELETE CATEGORY
        // =====================================================

        public async Task DeleteAsync(
            int id
        )
        {
            if (id <= 0)
            {
                throw new ArgumentException(
                    "Invalid category ID."
                );
            }


            var category =
                await _categoryRepository.GetByIdAsync(
                    id
                );


            if (category == null)
            {
                throw new KeyNotFoundException(
                    "Category not found."
                );
            }


            bool hasEvents =
                await _categoryRepository.HasEventsAsync(
                    id
                );


            if (hasEvents)
            {
                throw new InvalidOperationException(
                    "This category cannot be deleted because one or more events are assigned to it."
                );
            }


            _categoryRepository.Delete(
                category
            );


            await _categoryRepository.SaveChangesAsync();
        }


        // =====================================================
        // MAP ENTITY TO RESPONSE DTO
        // =====================================================

        private static CategoryResponseDto MapToResponse(
            EventCategory category
        )
        {
            return new CategoryResponseDto
            {
                Id =
                    category.Id,

                Name =
                    category.Name,

                Description =
                    category.Description,

                CreatedAt =
                    category.CreatedAt,

                UpdatedAt =
                    category.UpdatedAt
            };
        }
    }
}
