using Core.Entities;
using Core.Interfaces.ExternalServices;
using Core.Interfaces.Repositories;
using DataAccess.Mapping;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DataAccess.Repositories
{
    public class StudentCourseRepository : IStudentCourseRepository
    {
        private readonly DBHelpers _dBHelpers;
        private readonly ILogService _logService;

        public StudentCourseRepository(DBHelpers dBHelpers, ILogService logService)
        {
            _dBHelpers = dBHelpers;
            _logService = logService;
        }

        public async Task<int> AddStudentCourseAsync(StudentCourse studentCourse)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_StudentCourses_Insert", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    var enrollmentID = new SqlParameter("@EnrollmentID", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };

                    command.Parameters.Add(enrollmentID);
                    command.Parameters.AddWithValue("@CourseID", studentCourse.Course?.CourseID);
                    command.Parameters.AddWithValue("@StudentID", studentCourse.StudentID);
                    command.Parameters.AddWithValue("@IsPassed", studentCourse.IsPassed);


                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();

                    if (enrollmentID.Value != DBNull.Value && int.TryParse(enrollmentID.Value.ToString(), out int mID))
                    {
                        return mID;
                    }
                }
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(ex);
                throw;
            }

            return -1;
        }

        public async Task<bool> UpdateStudentCourseAsync(StudentCourse studentCourse)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_StudentCourses_Update", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    var result = new SqlParameter("@Result", SqlDbType.Bit)
                    {
                        Direction = ParameterDirection.Output
                    };

                    command.Parameters.Add(result);
                    command.Parameters.AddWithValue("@EnrollmentID", studentCourse.EnrolmentID);
                    command.Parameters.AddWithValue("@IsPassed", studentCourse.IsPassed);

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

        public async Task<bool> DeleteStudentCourseAsync(int enrollmentID)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_StudentCourses_Delete", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    var result = new SqlParameter("@Result", SqlDbType.Bit)
                    {
                        Direction = ParameterDirection.Output
                    };

                    command.Parameters.Add(result);
                    command.Parameters.AddWithValue("@EnrollmentID", enrollmentID);

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

        public async Task<StudentCourse?> GetStudentCourseByIDAsync(int enrollmentID)
        {
            StudentCourse? studentCourse = null;

            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_StudentCourses_GetById", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@EnrollmentID", enrollmentID);

                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (reader != null && await reader.ReadAsync())
                        {
                            studentCourse = reader.ToStudentCourse();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(ex);
                throw;
            }

            return studentCourse;
        }

        public async Task<IEnumerable<StudentCourse>?> GetStudentCoursesByStudentIDAsync(int studentID)
        {
            List<StudentCourse> studentCourses = new List<StudentCourse>();

            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_StudentCourses_GetByStudentId", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.AddWithValue("@StudentID", studentID);

                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (reader != null)
                        {
                            while (await reader.ReadAsync())
                            {
                                studentCourses.Add(reader.ToStudentCourse());
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

            return studentCourses;
        }

        public async Task<bool> SyncStudentCoursesAsync(int studentID, List<int> coursesIDs)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_SyncPassedCourses", connection))
                {
                    var table = new DataTable();
                    table.Columns.Add("CourseID", typeof(int));

                    foreach (var id in coursesIDs)
                    {
                        table.Rows.Add(id);
                    }

                    command.CommandType = CommandType.StoredProcedure;
                    var result = new SqlParameter("@Result", SqlDbType.Bit)
                    {
                        Direction = ParameterDirection.Output
                    };
                    command.Parameters.Add(result);
                    command.Parameters.AddWithValue("@StudentID", studentID);

                    var tvpParam = new SqlParameter("@PassedCoursesIDs", table)
                    {
                        SqlDbType = SqlDbType.Structured,
                        TypeName = "dbo.CourseIdListType"
                    };

                    command.Parameters.Add(tvpParam);

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

        public async Task<IEnumerable<Course>?> GetOpenCoursesByStudentIDAsync(int studentID)
        {
            List<Course> openCourses = new List<Course>();

            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_GetStudentOpenCourses", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.AddWithValue("@StudentID", studentID);

                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (reader != null)
                        {
                            while (await reader.ReadAsync())
                            {
                                openCourses.Add(reader.ToCourse());
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

            return openCourses;
        }

        public async Task<IEnumerable<StudentCoursePlanStatus>?> GetStudentPlanStatusAsync(int studentID)
        {
            List<StudentCoursePlanStatus> planStatusList = new List<StudentCoursePlanStatus>();

            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_StudentCourses_GetPlanStatus", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.AddWithValue("@StudentID", studentID);

                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (reader != null)
                        {
                            while (await reader.ReadAsync())
                            {
                                planStatusList.Add(reader.ToStudentCoursePlanStatus());
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

            return planStatusList;
        }
    }
}
