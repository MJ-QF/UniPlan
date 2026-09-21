using Business.DTOs.Requests.Create;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;
using Core.Entities;

namespace Business.Mapper
{
    public static class StudentMapper
    {
        public static Student ToStudent(this CreateStudentRequest request)
        {
            Account account = request.AccountData.ToAccount();
            Person person = request.PersonData.ToPerson();
            Major major = new Major(request.MajorID);

            return new Student(-1, person, account, major , 0);
        }

        public static void UpdateStudent(this Student student, UpdateStudentRequest? request)
        {
            if (request == null)
                return;

            student.Account?.UpdateAccount(request.AccountData);
            student.Person?.UpdatePerson(request.PersonData);

            if (student.Major != null)
                student.Major.MajorID = request.MajorID;
        }

        public static StudentResponse ToResponse(this Student student)
        {
            PersonResponse person = student.Person?.ToResponse() ?? new PersonResponse();
            AccountResponse account = student.Account?.ToResponse() ?? new AccountResponse();
            MajorResponse major = student.Major?.ToResponse() ?? new MajorResponse();

            return new StudentResponse(student.StudentID, person, account, major , student.CompletedHours);
        }
    }
}
