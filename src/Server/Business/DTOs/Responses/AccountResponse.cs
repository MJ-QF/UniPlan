namespace Business.DTOs.Responses
{
    public class AccountResponse
    {
        public int AccountID { get; set; }

        public string AccountName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public AccountResponse()
        {
            AccountID = -1;
            AccountName = string.Empty;
            Email = string.Empty;
        }

        public AccountResponse(int accountID, string accountName, string email, string role)
        {
            AccountID = accountID;
            AccountName = accountName;
            Email = email;
            Role = role;
        }
    }
}
