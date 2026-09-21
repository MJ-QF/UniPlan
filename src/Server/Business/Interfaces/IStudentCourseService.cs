using Business.DTOs.Requests.Create;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;

namespace Business.Interfaces
{
    public interface IStudentCourseService
    {
        Task<bool> DeleteStudentCourseAsync(int enrolmentD);

        Task<StudentCourseResponse?> AddStudentCourseAsync(CreateStudentCourseRequest request);

        Task<bool> UpdateStudentCourseAsync(UpdateStudentCourseRequest request, int enrolmentD);

        Task<IEnumerable<StudentCourseResponse>?> GetStudentCoursesByStudentIDAsync(int studentID);

        Task<StudentCourseResponse?> GetStudentCourseByIDAsync(int enrolmentD);

        Task<bool> SyncStudentCoursesAsync(int studentID, List<int> coursesIDs);

        Task<IEnumerable<CourseResponse>?> GetOpenCoursesByStudentIDAsync(int studentID);
    }
}
