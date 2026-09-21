using Business.DTOs.Requests;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;

namespace Business.Interfaces
{
    public interface IAccountService
    {
        Task<AccountResponse?> LoginAsync(LoginRequest request);

        Task<bool> UpdatePasswordAsync(ChangePasswordRequest request, int accountID);

        Task<AccountResponse?> GetAccountByIDAsync(int accountID);
    }
}
