using Business.DTOs.Requests;
using Business.DTOs.Requests.Create;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;
using Core.Entities;

namespace Business.Mapper
{
    public static class AccountMapper
    {
        public static Account ToAccount(this CreateAccountRequest request)
        {
            return new Account(request.AccountName, request.Password, request.Email);
        }

        public static Account ToAccount(this UpdateAccountRequest request)
        {
            return new Account(request.AccountName,"" , request.Email);
        }

        public static Account ToAccount(this LoginRequest request)
        {
            return new Account(request.AccountName, request.Password);
        }

        public static void UpdateAccount(this Account account, UpdateAccountRequest? request)
        {
            if (request == null)
                return;

            account.AccountName = request.AccountName;
            account.Email = request.Email;
        }

        public static void UpdateAccount(this Account account, ChangePasswordRequest? request)
        {
            if (request == null)
                return;

            account.Password = request.NewPassword ?? string.Empty;
        }

        public static AccountResponse ToResponse(this Account account)
        {
            return new AccountResponse(account.AccountID, account.AccountName, account.Email, account.Role);
        }
    }
}
