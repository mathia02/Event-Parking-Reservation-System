using EventParkingReservationSystem.API.DTOs.Categories;

namespace EventParkingReservationSystem.API.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<List<CategoryResponseDto>> GetAllAsync();

        Task<CategoryResponseDto?> GetByIdAsync(int id);

        Task<CategoryResponseDto> CreateAsync(
            CreateCategoryRequestDto request
        );

        Task<CategoryResponseDto> UpdateAsync(
            int id,
            UpdateCategoryRequestDto request
        );

        Task DeleteAsync(int id);
    }
}
