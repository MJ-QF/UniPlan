using Business.DTOs.Requests.Create;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;
using Business.Interfaces;
using Business.Mapper;
using Core.Interfaces.ExternalServices;
using Core.Interfaces.Repositories;

namespace Business.Services
{
    public class AdministratorService : IAdministratorService
    {

        private IAdminRepository _AdminRepository;
        private IValidationService _ValidationService;

        public AdministratorService(IAdminRepository adminRepostery, IValidationService iValidationService)
        {
            _AdminRepository = adminRepostery;
            _ValidationService = iValidationService;
        }



        public async Task<AdministratorResponse?> AddAdministratorAsync(CreateAdministratorRequest request)
        {
            _ValidationService.Validate(request);

            var _admin = request.ToAdministrator();

            var result = await _AdminRepository.AddAdminAsync(_admin);

            if (result)
            {
                _admin = await _AdminRepository.GetAdminByIDAsync(_admin.AdminID);

                if (_admin!.AdminID > 0 && _admin.Account!.AccountID > 0)
                {
                    return _admin.ToResponse();
                }
            }

            return null;
        }

        public async Task<bool> DeleteAdministratorAsync(int adminID)
        {
            return await _AdminRepository.DeleteAdminAsync(adminID);
        }

        public async Task<AdministratorResponse?> GetAdministratorByIdAsync(int adminID)
        {
            var _admin = await _AdminRepository.GetAdminByIDAsync(adminID);
            return _admin?.ToResponse() ?? null;
        }

        public async Task<bool> UpdateAdministratorAsync(int adminID, UpdateAdministratorRequest request)
        {
            _ValidationService.Validate(request);

            var _admin = request.ToAdministrator(adminID);

            if (_admin != null)
            {
                return await _AdminRepository.UpdateAdminAsync(_admin);
            }

            return false;
        }

        public async Task<IEnumerable<AdministratorResponse>> GetPageAdministratorsAsync(int pageNumber = 1, int pageSize = 10)
        {
            var admins = await _AdminRepository.GetPageAdminsAsync(pageNumber, pageSize);

            var responses = admins?.Select(admin => admin.ToResponse()).Where(adm => adm != null);

            return responses?.Select(response => response!).ToList() ?? new List<AdministratorResponse>();
        }

        public async Task<AdministratorResponse?> GetAdminByAccountIDAsync(int accountID)
        {
            var _admin = await _AdminRepository.GetAdminByAccountIDAsync(accountID);
            return _admin?.ToResponse() ?? null;
        }
    }
}
