using Business.DTOs.Requests;
using Business.DTOs.Requests.Create;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;
using Core.Entities;

namespace Business.Mapper
{
    public static class AdminMapper
    {

        public static Administrator ToAdministrator(this CreateAdministratorRequest request, int adminID = -1)
        {
            Person person = new Person(request.PersonID);
            Account? account = request.Account!.ToAccount();
            return new Administrator(adminID, person, account, true);
        }

        public static Administrator ToAdministrator(this UpdateAdministratorRequest request, int adminID = -1)
        {
            Person person = request.Person.ToPerson();
            Account? account = request.Account!.ToAccount();
            return new Administrator(adminID, person, account, true);
        }

        public static void UpdateAdmin(this Administrator admin, UpdateAdministratorRequest request)
        {
            admin.Account!.UpdateAccount(request.Account);
            admin.Person = request.Person.ToPerson();
        }

        public static AdministratorResponse ToResponse(this Administrator admin)
        {
            PersonResponse person = new PersonResponse(admin.Person!.PersonID, admin.Person!.FirstName, admin.Person.MiddleName, admin.Person.LastName);
            AccountResponse account = new AccountResponse(admin.Account!.AccountID, admin.Account.AccountName, admin.Account.Email, "Admin");
            return new AdministratorResponse(admin.AdminID, person, account, admin.IsActive);
        }

    }
}
