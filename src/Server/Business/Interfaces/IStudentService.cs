using Business.DTOs.Requests.Create;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;

namespace Business.Interfaces
{
    public interface IStudentService
    {
        Task<bool> DeleteStudentAsync(int studentID);

        Task<StudentResponse?> AddStudentAsync(CreateStudentRequest request);

        Task<bool> UpdateStudentAsync(UpdateStudentRequest request, int studentID);

        Task<IEnumerable<StudentResponse>?> GetPagedStudentsAsync(int pageNumber = 1, int pageSize = 10);

        Task<StudentResponse?> GetStudentByIDAsync(int studentID);

        Task<StudentResponse?> GetStudentByAccountIDAsync(int accountID);
    }
}
