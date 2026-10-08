using Core.Entities;

namespace Core.Interfaces.Repositories
{
    public interface ICourseSessionRepository
    {
        Task<int> AddCourseSessionAsync(CourseSession courseSession);

        Task<bool> UpdateCourseSessionAsync(CourseSession courseSession);

        Task<bool> DeleteCourseSessionAsync(int sessionID);

        Task<CourseSession?> GetCourseSessionByIDAsync(int sessionID);

        Task<Dictionary<int, Dictionary<int, List<CourseSession>>>?> GetWishlistSessionsByTimeSlotAsync(int listID, List<int> days, TimeSpan startTime, TimeSpan endTime);

        Task<IEnumerable<CourseSession?>?> GetCourseSessionsPagedAsync(int pageNumber, int pageSize);

    }
}
