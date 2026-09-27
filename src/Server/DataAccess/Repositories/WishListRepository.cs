using Business.Interfaces;
using Core.Entities;
using Core.Interfaces.ExternalServices;
using DataAccess.Mapping;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DataAccess.Repositories
{
    public class WishListRepository : IWishListRepository
    {
        private readonly DBHelpers _dBHelpers;
        private readonly ILogService _logService;


        public WishListRepository(DBHelpers dBHelpers, ILogService logService)
        {
            _dBHelpers = dBHelpers;
            _logService = logService;
        }

        public async Task<int> AddWishListAsync(WishList list)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_WishLists_Insert", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    var listID = new SqlParameter("@WishListID", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };


                    command.Parameters.Add(listID);

                    command.Parameters.AddWithValue("@StudentID", list.StudentTerm.StudentID);
                    command.Parameters.AddWithValue("@TermID", list.StudentTerm.AcademicTerm?.TermID);
                    command.Parameters.AddWithValue("@CoursesIDs", list.CourseIDs?.ToDataTable());


                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();


                    if (listID.Value != DBNull.Value && int.TryParse(listID.Value.ToString(), out int lID))
                    {
                        return lID;
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

        public async Task<bool> DeleteWishListAsync(int listID)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_WishLists_Delete", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    var result = new SqlParameter("@Result", SqlDbType.Bit)
                    {
                        Direction = ParameterDirection.Output
                    };

                    command.Parameters.Add(result);
                    command.Parameters.AddWithValue("@WishListID", listID);

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

        public async Task<WishList?> GetWishListByIDAsync(int listID)
        {
            WishList? list = null;

            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_WishLists_GetById", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@WishListID", listID);

                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (reader != null && await reader.ReadAsync())
                        {
                            list = reader.ToWishList();
                        }
                    }


                }
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(ex);
                throw;
            }

            return list;
        }

        public async Task<IEnumerable<WishList>?> GetWishListsByStudentIDAsync(int studentID, int pageNumber = 1, int pageSize = 10)
        {
            List<WishList>? lists = new List<WishList>();

            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_WishLists_GetByStudentID", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.AddWithValue("@PageNumber", pageNumber);
                    command.Parameters.AddWithValue("@PageSize", pageSize);
                    command.Parameters.AddWithValue("@StudentID", studentID);

                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (reader != null)
                        {
                            while (await reader.ReadAsync())
                            {
                                WishList list = reader.ToWishList();
                                lists.Add(list);
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

            return lists;
        }

        public async Task<bool> SyncCoursesAsync(WishList list)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_WishListItems_SyncCourses", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    command.Parameters.AddWithValue("@ListId", list.WishListID);

                    var coursesParam = command.Parameters.AddWithValue("@CoursesIDs", list.CourseIDs?.ToDataTable());
                    coursesParam.SqlDbType = SqlDbType.Structured;
                    coursesParam.TypeName = "CourseIdListType";

                    var resultParam = new SqlParameter("@Result", SqlDbType.Bit)
                    {
                        Direction = ParameterDirection.Output
                    };
                    command.Parameters.Add(resultParam);

                    await connection.OpenAsync();
                    await command.ExecuteNonQueryAsync();

                    if (resultParam.Value != DBNull.Value && bool.TryParse(resultParam.Value.ToString(), out bool res))
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
    }
}
