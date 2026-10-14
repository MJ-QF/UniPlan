using Core.Entities;
using Core.Interfaces.ExternalServices;
using Core.Interfaces.Repositories;
using DataAccess.Mapping;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DataAccess.Repositories
{
    public class AdminRepository : IAdminRepository
    {

        private readonly DBHelpers _dBHelpers;
        private readonly ILogService _logService;

        public AdminRepository(DBHelpers dBHelpers, ILogService logService, IExceptionService exceptionService)
        {
            this._dBHelpers = dBHelpers;
            _logService = logService;
        }

        public async Task<bool> AddAdminAsync(Administrator admin)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_AdminProfile_Insert", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    var adminID = new SqlParameter("@AdministratorID", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };


                    var accountID = new SqlParameter("@AccountID", SqlDbType.Int)
                    {
                        Direction = ParameterDirection.Output
                    };


                    var result = new SqlParameter("@Result", SqlDbType.Bit)
                    {
                        Direction = ParameterDirection.Output
                    };

                    command.Parameters.Add(adminID);
                    command.Parameters.Add(accountID);
                    command.Parameters.Add(result);

                    command.Parameters.AddWithValue("@IsActive", admin.IsActive);

                    if (admin.Person == null) throw new ArgumentNullException(nameof(admin.Person), "Person is Null");
                    command.Parameters.AddWithValue("@PersonID", admin.Person.PersonID);
                    if (admin.Account == null) throw new ArgumentNullException(nameof(admin.Account), "Account is Null");
                    command.Parameters.AddWithValue("@AccountName", admin.Account.AccountName);
                    command.Parameters.AddWithValue("@Password", admin.Account.Password);
                    command.Parameters.AddWithValue("@Email", admin.Account.Email);

                    await connection.OpenAsync();

                    command.ExecuteNonQuery();
                    if (!(adminID.Value != DBNull.Value && int.TryParse(adminID.Value.ToString(), out int admID)))
                    {
                        admID = -1;
                    }
                    admin.AdminID = admID;
                    if (!(accountID.Value != DBNull.Value && int.TryParse(accountID.Value.ToString(), out int accntID)))
                    {
                        accntID = -1;
                    }
                    admin.Account.AccountID = accntID;

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


        public async Task<Administrator?> GetAdminByAccountIDAsync(int accountID)
        {
            Administrator? admin = null;

            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_AdminProfile_GetByAccountId", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@AccountID", accountID);

                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (reader != null && await reader.ReadAsync())
                        {
                            admin = reader.ToAdmin();
                        }
                    }


                }
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(ex);
                throw;
            }

            return admin;
        }


        public async Task<bool> UpdateAdminAsync(Administrator admin)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_AdminProfile_Update", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    var result = new SqlParameter("@Result", SqlDbType.Bit)
                    {
                        Direction = ParameterDirection.Output
                    };

                    command.Parameters.Add(result);

                    command.Parameters.AddWithValue("@IsActive", admin.IsActive);
                    command.Parameters.AddWithValue("@AdministratorID", admin.AdminID);
                    if (admin.Account == null) throw new ArgumentNullException(nameof(admin.Account), "Account is Null");
                    command.Parameters.AddWithValue("@AccountName", admin.Account.AccountName);
                    command.Parameters.AddWithValue("@Email", admin.Account.Email);
                    if (admin.Person == null) throw new ArgumentNullException(nameof(admin.Person), "Person is Null");
                    command.Parameters.AddWithValue("@FirstName", admin.Person.FirstName);
                    command.Parameters.AddWithValue("@LastName", admin.Person.LastName);
                    command.Parameters.AddWithValue("@MiddleName", admin.Person.MiddleName ?? (object)DBNull.Value);

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

        public async Task<bool> DeleteAdminAsync(int adminID)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_AdminProfile_Delete", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;

                    var result = new SqlParameter("@Result", SqlDbType.Bit)
                    {
                        Direction = ParameterDirection.Output
                    };

                    command.Parameters.Add(result);
                    command.Parameters.AddWithValue("@AdministratorID", adminID);

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

        public async Task<Administrator?> GetAdminByIDAsync(int adminID)
        {
            Administrator? admin = null;

            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_AdminProfile_GetById", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@AdminID", adminID);

                    await connection.OpenAsync();
                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (reader != null && await reader.ReadAsync())
                        {
                            admin = reader.ToAdmin();
                            admin.AdminID = adminID;
                        }
                    }


                }
            }
            catch (Exception ex)
            {
                await _logService.LogAsync(ex);
                throw;
            }

            return admin;
        }

        public async Task<IReadOnlyCollection<Administrator>?> GetPageAdminsAsync(int pageNumber = 1, int pageSize = 10)
        {
            List<Administrator>? admins = new List<Administrator>();

            try
            {
                using (SqlConnection connection = new SqlConnection(_dBHelpers.ConnectionString))
                using (SqlCommand command = new SqlCommand("SP_AdminProfile_GetAll", connection))
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
                                admins.Add(reader.ToAdmin());
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

            return admins;
        }


    }
}
