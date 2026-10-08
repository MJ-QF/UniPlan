using Core.Entities;
using Core.Exceptions;
using Core.Interfaces.ExternalServices;
using Core.Interfaces.Repositories;
using DataAccess.Extensions;
using DataAccess.Mapping;
using Microsoft.Data.SqlClient;
using System.Collections.Generic;
using System.Data;

namespace DataAccess.Repositories
{
    public class CourseSessionRepository : ICourseSessionRepository
    {
        private readonly DBHelpers _dBHelpers;
        private readonly ILogService _logService;

        public CourseSessionRepository
        (
            DBHelpers dBHelpers,
            ILogService logService
        )
        {
            _dBHelpers = dBHelpers;
            _logService = logService;
        }

        public async Task<int> AddCourseSessionAsync(CourseSession courseSession)
        {
            try
            {
                using SqlConnection connection =
                    new SqlConnection(_dBHelpers.ConnectionString);

                using SqlCommand command =
                    new SqlCommand("SP_CourseSessions_Insert", connection);

                command.CommandType = CommandType.StoredProcedure;

                var sessionID = new SqlParameter("@SessionID", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };

                command.Parameters.Add(sessionID);

                command.Parameters.AddWithValue
                (
                    "@OfferingID",
                    courseSession.CourseOffering?.OfferingID
                );

                command.Parameters.AddWithValue
                (
                    "@HallID",
                    courseSession.Hall?.HallID
                );

                command.Parameters.AddWithValue
                (
                    "@StartTime",
                    courseSession.StartTime
                );

                command.Parameters.AddWithValue
                (
                    "@EndTime",
                    courseSession.EndTime
                );

                command.Parameters.AddWithValue
                (
                    "@CreatedByAdminID",
                    courseSession.CreatedByAdminID
                );

                command.Parameters.AddWithValue
                (
                    "@DayNum",
                    courseSession.Day
                );

                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                if (sessionID.Value != DBNull.Value &&
                    int.TryParse(sessionID.Value.ToString(), out int id))
                {
                    return id;
                }
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(ex);
                throw;
            }

            return -1;
        }

        public async Task<bool> UpdateCourseSessionAsync(CourseSession courseSession)
        {
            try
            {
                using SqlConnection connection =
                    new SqlConnection(_dBHelpers.ConnectionString);

                using SqlCommand command =
                    new SqlCommand("SP_CourseSessions_Update", connection);

                command.CommandType = CommandType.StoredProcedure;

                var result = new SqlParameter("@Result", SqlDbType.Bit)
                {
                    Direction = ParameterDirection.Output
                };

                command.Parameters.Add(result);

                command.Parameters.AddWithValue
                (
                    "@SessionID",
                    courseSession.SessionID
                );

                command.Parameters.AddWithValue
                (
                    "@OfferingID",
                    courseSession.CourseOffering?.OfferingID
                );

                command.Parameters.AddWithValue
                (
                    "@HallID",
                    courseSession.Hall?.HallID
                );

                command.Parameters.AddWithValue
                (
                    "@StartTime", 
                    courseSession.StartTime
                );

                command.Parameters.AddWithValue
                (
                    "@EndTime", 
                    courseSession.EndTime
                );

                command.Parameters.AddWithValue
                (
                    "@CreatedByAdminID",
                    courseSession.CreatedByAdminID
                );

                command.Parameters.AddWithValue
                (
                    "@DayNum",
                    courseSession.Day
                );

                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                if (result.Value != DBNull.Value &&
                    bool.TryParse(result.Value.ToString(), out bool res))
                {
                    return res;
                }
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(ex);
                throw;
            }

            return false;
        }

        public async Task<bool> DeleteCourseSessionAsync(int sessionID)
        {
            try
            {
                using SqlConnection connection =
                    new SqlConnection(_dBHelpers.ConnectionString);

                using SqlCommand command =
                    new SqlCommand("SP_CourseSessions_Delete", connection);

                command.CommandType = CommandType.StoredProcedure;

                var result = new SqlParameter("@Result", SqlDbType.Bit)
                {
                    Direction = ParameterDirection.Output
                };

                command.Parameters.Add(result);

                command.Parameters.AddWithValue
                (
                    "@SessionID",
                    sessionID
                );

                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                if (result.Value != DBNull.Value &&
                    bool.TryParse(result.Value.ToString(), out bool res))
                {
                    return res;
                }
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(ex);
                throw;
            }

            return false;
        }

        public async Task<CourseSession?> GetCourseSessionByIDAsync(int sessionID)
        {
            CourseSession? courseSession = null;

            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_CourseSessions_GetById", connection))
                {

                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.AddWithValue
                    (
                        "@SessionID",
                        sessionID
                    );

                    await connection.OpenAsync();

                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (reader != null && await reader.ReadAsync())
                        {
                            courseSession = reader.ToCourseSession();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(ex);
                throw;
            }

            return courseSession;
        }


        public async Task<IEnumerable<CourseSession?>?>GetCourseSessionsPagedAsync(int pageNumber, int pageSize)
        {
            List<CourseSession> courseSessions = new();

            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_CourseSessions_GetAll", connection))
                {


                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.AddWithValue
                    (
                        "@PageNumber",
                        pageNumber
                    );

                    command.Parameters.AddWithValue
                    (
                        "@PageSize",
                        pageSize
                    );

                    await connection.OpenAsync();


                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            courseSessions.Add(reader.ToCourseSession());
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(ex);
                throw;
            }

            return courseSessions;
        }

        public async Task<Dictionary<int, Dictionary<int, List<CourseSession>>>?> GetWishlistSessionsByTimeSlotAsync(int listID, List<int> days, TimeSpan startTime, TimeSpan endTime)
        {
            Dictionary<int, Dictionary<int, List<CourseSession>>> courseSessions = new();

            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_CourseSessions_GetByWishListID", connection))
                {


                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.AddWithValue
                    (
                        "@WishListId",
                        listID
                    );

                    command.Parameters.AddWithValue
                    (
                        "@Days",
                        days.ToDataTable()
                    );

                    command.Parameters.AddWithValue
                    (   
                        "@StartTime", 
                        startTime
                    );

                    command.Parameters.AddWithValue
                    (
                        "@EndTime",
                        endTime
                    );

                    await connection.OpenAsync();


                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            reader.ReadInt("LectureID", out int lectureID, 0);
                            reader.ReadInt("OfferingID", out int offeringID, 0);
                            CourseSession session = reader.ToScheduleContextSession();

                            if (!courseSessions.ContainsKey(lectureID))
                            {
                                courseSessions.Add(lectureID, new());
                            }

                            if (!courseSessions[lectureID].ContainsKey(offeringID))
                            {
                                courseSessions[lectureID].Add(offeringID, new());
                            }

                            courseSessions[lectureID][offeringID].Add(session);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(ex);
                throw;
            }

            return courseSessions;
        }
    }
}