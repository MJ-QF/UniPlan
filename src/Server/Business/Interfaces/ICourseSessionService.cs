using Business.DTOs.Requests.Create;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;
using Core.Entities;

namespace Business.Interfaces
{
    public interface ICourseSessionService
    {
        Task<bool> DeleteCourseSessionAsync(int courseSessionID);

        Task<CourseSessionResponse?> AddCourseSessionAsync(CreateCourseSessionRequest request);

        Task<bool> UpdateCourseSessionAsync(UpdateCourseSessionRequest request, int courseSessionID);

        Task<IEnumerable<CourseSessionResponse>?> SearchCourseSessionsAsync(int termID, int dayNum, string? courseName = null);

        Task<Dictionary<int, Dictionary<int, List<CourseSession>>>?> GetWishlistSessionsByTimeSlotAsync(int listID, List<int> days, TimeSpan startTime, TimeSpan endTime);

        Task<CourseSessionResponse?> GetCourseSessionByIDAsync(int courseSessionID);
    }
}
