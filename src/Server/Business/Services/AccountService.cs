using Business.DTOs.Requests;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;
using Business.Interfaces;
using Business.Mapper;
using Core.Entities;
using Core.Interfaces.ExternalServices;
using Core.Interfaces.Repositories;

namespace Business.Services
{
    public class AccountService : IAccountService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IValidationService _validationService;

        public AccountService(IAccountRepository accountRepository, IPasswordHasher passwordHasher, IValidationService validationService)
        {
            _validationService = validationService;
            _accountRepository = accountRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<AccountResponse?> GetAccountByIDAsync(int accountID)
        {
            if (accountID <= 0)
                return null;

            Account? account = await _accountRepository.GetAccountByIDAsync(accountID);
            return account != null ? account.ToResponse() : null;
        }

        public async Task<AccountResponse?> LoginAsync(LoginRequest request)
        {
            _validationService.Validate(request);
            Account? account = await _accountRepository.GetAccountByNameAsync(request.AccountName);

            if (_passwordHasher.VerifyPassword(request.Password, account?.Password ?? string.Empty))
                return account?.ToResponse();

            return null;
        }

        public async Task<bool> UpdatePasswordAsync(ChangePasswordRequest request, int accountID)
        {
            _validationService.Validate(request);
            Account? account = await _accountRepository.GetAccountByIDAsync(accountID);

            if (account != null)
            {
                if(_passwordHasher.VerifyPassword(request.OldPassword ?? string.Empty, account.Password))
                {
                    account.UpdateAccount(request);
                    account.Password = _passwordHasher.HashPassword(account.Password);

                    return await _accountRepository.UpdatePasswordAsync(account);
                }
            }

            return false;
        }
    }
}
