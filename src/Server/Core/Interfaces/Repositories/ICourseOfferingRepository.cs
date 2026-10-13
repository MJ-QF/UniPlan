using Core.Entities;

namespace Core.Interfaces.Repositories
{
    public interface ICourseOfferingRepository
    {
        Task<bool> DeleteCourseOfferingAsync(int courseOfferingID);

        Task<bool> AddCourseOfferingsAsync(CourseOffering courseOffering, int numberOfSections);

        Task<bool> UpdateCourseOfferingAsync(CourseOffering courseOffering);

        Task<IEnumerable<CourseOffering>?> SearchCourseOfferingsAsync(int? termID = null, string? courseName = null, int pageNumber = 1, int pageSize = 10);

        Task<CourseOffering?> GetCourseOfferingByIDAsync(int courseOfferingID);
    }
}
