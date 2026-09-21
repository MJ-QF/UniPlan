using Core.Entities;

namespace Core.Interfaces.Repositories
{
    public interface IAccountRepository
    {
        Task<bool> UpdatePasswordAsync(Account account);

        Task<Account?> GetAccountByIDAsync(int accountID);

        Task<Account?> GetAccountByNameAsync(string accountName);
    }
}
