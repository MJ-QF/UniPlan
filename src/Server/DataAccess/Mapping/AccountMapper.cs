using Core.Entities;
using DataAccess.Extensions;
using Microsoft.Data.SqlClient;

namespace DataAccess.Mapping
{
    public static class AccountMapper
    {
        public static Account ToAccount(this SqlDataReader reader)
        {
            reader.ReadInt("AccountID", out int accountID, 0);
            reader.ReadString("AccountName", out string accountName, string.Empty);
            reader.ReadString("Email", out string email, string.Empty);
            reader.ReadString("Password", out string password, string.Empty);
            reader.ReadString("Role", out string role, string.Empty);

            return new Account(accountID, accountName, email, password, role);
        }
    }
}
