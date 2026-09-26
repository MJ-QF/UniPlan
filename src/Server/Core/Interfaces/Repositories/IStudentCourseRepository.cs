using Core.Entities;

namespace Core.Interfaces.Repositories
{
    public interface IStudentCourseRepository
    {
        Task<int> AddStudentCourseAsync(StudentCourse studentCourse);

        Task<bool> UpdateStudentCourseAsync(StudentCourse studentCourse);

        Task<bool> DeleteStudentCourseAsync(int enrolmentID);

        Task<StudentCourse?> GetStudentCourseByIDAsync(int enrolmentID);

        Task<IEnumerable<StudentCourse>?> GetStudentCoursesByStudentIDAsync(int studentID);

        Task<bool> SyncStudentCoursesAsync(int studentID, List<int> coursesIDs);

        Task<IEnumerable<Course>?> GetOpenCoursesByStudentIDAsync(int studentID);

        Task<IEnumerable<StudentCoursePlanStatus>?> GetStudentPlanStatusAsync(int studentID);
    }
}

