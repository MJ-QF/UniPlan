using Core.Entities;

namespace Core.Interfaces.Repositories
{
    public interface IStudentRepository
    {
        Task<bool> DeleteStudentAsync(int studentID);

        Task<bool> AddStudentAsync(Student student);

        Task<bool> UpdateStudentAsync(Student student);

        Task<IEnumerable<Student>?> GetPagedStudentsAsync(int pageNumber = 1, int pageSize = 10);

        Task<Student?> GetStudentByIDAsync(int studentID);

        Task<Student?> GetStudentByAccountIDAsync(int accountID);
    }
}
