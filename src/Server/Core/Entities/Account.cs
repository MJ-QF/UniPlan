
namespace Core.Entities
{
    public class Account
    {
        public int AccountID { get; set; }

        public string AccountName { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;


        public Account(string accountName, string password)
        {
            AccountName = accountName;
            Password = password;
        }

        public Account(string accountName, string password, string email)
        {
            AccountName = accountName;
            Password = password;
            Email = email;
        }

        public Account(int accountID, string accountName, string email, string password, string role)
        {
            AccountID = accountID;
            AccountName = accountName;
            Email = email;
            Password = password;
            Role = role;
        }
    }
}
