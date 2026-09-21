using Core.Entities;
using Core.Interfaces.ExternalServices;
using Core.Interfaces.Repositories;
using DataAccess.Mapping;
using Microsoft.Data.SqlClient;
using System.Data;


namespace DataAccess.Repositories
{
    public class StudentRepository : IStudentRepository
    {
        public readonly DBHelpers _dBHelpers;
        private readonly ILogService _logService;

        public StudentRepository(DBHelpers dBHelpers, ILogService logService)
        {
            _dBHelpers = dBHelpers;
            _logService = logService;
        }

        public async Task<bool> AddStudentAsync(Student student)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_StudentProfile_Insert", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    var studentID = new SqlParameter("@StudentID", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };

                    var accountID = new SqlParameter("@AccountID", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };

                    var personID = new SqlParameter("@PersonID", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };

                    var result = new SqlParameter("@Result", SqlDbType.Bit)
                    {
                        Direction = ParameterDirection.Output
                    };

                    command.Parameters.Add(personID);
                    command.Parameters.Add(accountID);
                    command.Parameters.Add(result);

                    command.Parameters.AddWithValue("@AccountName", student.Account?.AccountName);
                    command.Parameters.AddWithValue("@Password", student.Account?.Password);
                    command.Parameters.AddWithValue("@Email", student.Account?.Email);
                    command.Parameters.AddWithValue("@MajorID", student.Major?.MajorID);
                    command.Parameters.AddWithValue("@FirstName", student.Person?.FirstName);
                    command.Parameters.AddWithValue("@MiddleName", student.Person?.MiddleName != null ? student.Person?.MiddleName : DBNull.Value);
                    command.Parameters.AddWithValue("@LastName", student.Person?.LastName);

                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();

                    if (studentID.Value != DBNull.Value && int.TryParse(studentID.Value.ToString(), out int sID))
                    {
                        student.StudentID = sID;
                    }

                    if (personID.Value != DBNull.Value && int.TryParse(personID.Value.ToString(), out int pID) && student.Person != null)
                    {
                        student.Person.PersonID = pID;
                    }

                    if (accountID.Value != DBNull.Value && int.TryParse(accountID.Value.ToString(), out int aID) && student.Account != null)
                    {
                        student.Account.AccountID = aID;
                    }

                    if (result.Value != DBNull.Value && bool.TryParse(result.Value.ToString(), out bool res))
                    {
                        return res;
                    }
                }
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(ex);
                throw;
            }

            return false;
        }

        public async Task<bool> UpdateStudentAsync(Student student)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_StudentProfile_Update", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    var result = new SqlParameter("@Result", SqlDbType.Bit)
                    {
                        Direction = ParameterDirection.Output
                    };

                    command.Parameters.Add(result);

                    command.Parameters.AddWithValue("@AccountName", student.Account?.AccountName);
                    command.Parameters.AddWithValue("@Email", student.Account?.Email);
                    command.Parameters.AddWithValue("@StudentID", student.StudentID);
                    command.Parameters.AddWithValue("@MajorID", student.Major?.MajorID);
                    command.Parameters.AddWithValue("@FirstName", student.Person?.FirstName);
                    command.Parameters.AddWithValue("@MiddleName", student.Person?.MiddleName != null ? student.Person?.MiddleName : DBNull.Value);
                    command.Parameters.AddWithValue("@LastName", student.Person?.LastName);

                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();

                    if (result.Value != DBNull.Value && bool.TryParse(result.Value.ToString(), out bool res))
                    {
                        return res;
                    }
                }
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(ex);
                throw;
            }

            return false;
        }

        public async Task<bool> DeleteStudentAsync(int studentID)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_StudentProfile_Delete", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    var result = new SqlParameter("@Result", SqlDbType.Bit)
                    {
                        Direction = ParameterDirection.Output
                    };

                    command.Parameters.Add(result);
                    command.Parameters.AddWithValue("@StudentID", studentID);

                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();

                    if (result.Value != DBNull.Value && bool.TryParse(result.Value.ToString(), out bool res))
                    {
                        return res;
                    }
                }
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(ex);
                throw;
            }

            return false;
        }

        public async Task<Student?> GetStudentByIDAsync(int studentID)
        {
            Student? student = null;

            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_StudentProfile_GetById", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@StudentID", studentID);

                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (reader != null && await reader.ReadAsync())
                        {
                            student = reader.ToStudent();
                        }
                    }


                }
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(ex);
                throw;
            }

            return student;
        }

        public async Task<IEnumerable<Student>?> GetPagedStudentsAsync(int pageNumber = 1, int pageSize = 10)
        {
            List<Student>? students = new List<Student>();

            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_StudentProfile_GetAll", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.AddWithValue("@PageNumber", pageNumber);
                    command.Parameters.AddWithValue("@PageSize", pageSize);

                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (reader != null)
                        {
                            while (await reader.ReadAsync())
                            {
                                students.Add(reader.ToStudent());
                            }
                        }
                    }


                }
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(ex);
                throw;
            }

            return students;
        }

    }
}
