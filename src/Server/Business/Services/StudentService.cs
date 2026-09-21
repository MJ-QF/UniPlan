using Business.DTOs.Requests.Create;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;
using Business.Interfaces;
using Business.Mapper;
using Core.Entities;
using Core.Interfaces.ExternalServices;
using Core.Interfaces.Repositories;

namespace Business.Services
{
    public class StudentService : IStudentService
    {
        private readonly IStudentRepository _studentRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IValidationService _validationService;

        public StudentService(IStudentRepository studentRepository, IPasswordHasher passwordHasher, IValidationService validationService)
        {
            _validationService = validationService;
            _studentRepository = studentRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<bool> DeleteStudentAsync(int studentID)
        {
            return studentID > 0 && await _studentRepository.DeleteStudentAsync(studentID);
        }

        public async Task<StudentResponse?> AddStudentAsync(CreateStudentRequest request)
        {
            _validationService.Validate(request);

            Student student = request.ToStudent();

            if (student.Account != null)
                student.Account.Password = _passwordHasher.HashPassword(student.Account.Password);

            if (await _studentRepository.AddStudentAsync(student))
                return await GetStudentByIDAsync(student.StudentID);

            return null;
        }

        public async Task<bool> UpdateStudentAsync(UpdateStudentRequest request, int studentID)
        {
            _validationService.Validate(request);

            Student? student = await _studentRepository.GetStudentByIDAsync(studentID);

            student?.UpdateStudent(request);

            if (student != null)
                return await _studentRepository.UpdateStudentAsync(student);

            return false;
        }

        public async Task<IEnumerable<StudentResponse>?> GetPagedStudentsAsync(int pageNumber = 1, int pageSize = 10)
        {
            IEnumerable<Student>? students = await _studentRepository.GetPagedStudentsAsync(pageNumber, pageSize);
            return students?.Select(m => m.ToResponse()).OfType<StudentResponse>();
        }

        public async Task<StudentResponse?> GetStudentByIDAsync(int studentID)
        {
            if (studentID <= 0)
                return null;

            Student? student = await _studentRepository.GetStudentByIDAsync(studentID);
            return student != null ? student.ToResponse() : null;
        }

        public async Task<StudentResponse?> GetStudentByAccountIDAsync(int accountID)
        {
            if (accountID <= 0)
                return null;

            Student? student = await _studentRepository.GetStudentByAccountIDAsync(accountID);
            return student != null ? student.ToResponse() : null;
        }
    }
}
