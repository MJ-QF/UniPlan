using Business.DTOs.Requests;
using Business.DTOs.Responses;

namespace Business.Interfaces
{
    public interface IGeneratedScheduleService
    {
        Task<GeneratedScheduleResponse?> AddGeneratedScheduleAsync(GeneratedScheduleRequest schedule);

        Task<GeneratedScheduleResponse?> GetGeneratedScheduleByWishListIDAsync(int listID);

        Task<ScheduleDetailResponse?> GetScheduleDetailByWishListIDAsync(int listID, int scheduleNum);

        Task<IEnumerable<GeneratedScheduleResponse>?> GetSchedulesByStudentIDAsync(int studentID, int pageNumber = 1, int pageSize = 10);
    }
}
