using Core.Entities;

namespace Core.Interfaces.Repositories
{
    public interface IGeneratedScheduleRepository
    {
        Task<bool> AddGeneratedScheduleAsync(GeneratedSchedule schedule);

        Task<GeneratedSchedule?> GetGeneratedScheduleByWishListIDAsync(int listID);

        Task<GeneratedSchedule?> GetScheduleDetailByWishListIDAsync(int listID, int scheduleNum);

        Task<IEnumerable<GeneratedSchedule>?> GetSchedulesByStudentIDAsync(int studentID, int pageNumber = 1, int pageSize = 10);
    }
}
