using Business.DTOs.Requests.Create;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;

namespace Business.Interfaces
{
    public interface IAdministratorService
    {
        Task<IEnumerable<AdministratorResponse>> GetPageAdministratorsAsync(int pageNumber, int pageSize);

        Task<AdministratorResponse?> GetAdministratorByIdAsync(int adminID);

        Task<AdministratorResponse?> AddAdministratorAsync(CreateAdministratorRequest admin);

        Task<bool> UpdateAdministratorAsync(int adminID, UpdateAdministratorRequest admin);

        Task<bool> DeleteAdministratorAsync(int adminID);

        Task<AdministratorResponse?> GetAdminByAccountIDAsync(int accountID);
    }
}
