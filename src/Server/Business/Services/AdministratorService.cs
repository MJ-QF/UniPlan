using Business.DTOs.Requests.Create;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;
using Business.Interfaces;
using Business.Mapper;
using Core.Entities;
using Core.Interfaces.ExternalServices;
using Core.Interfaces.Repositories;

namespace Business.Services
{
    public class AdministratorService : IAdministratorService
    {

        private readonly IAdminRepository _adminRepository;
        private readonly IValidationService _ValidationService;
        private readonly IPasswordHasher _passwordHasher;


        public AdministratorService(IAdminRepository adminRepostery, IValidationService iValidationService, IPasswordHasher passwordHasher)
        {
            _adminRepository = adminRepostery;
            _ValidationService = iValidationService;
            _passwordHasher = passwordHasher;
        }



        public async Task<AdministratorResponse?> AddAdministratorAsync(CreateAdministratorRequest request)
        {
            _ValidationService.Validate(request);

            var admin = request.ToAdministrator();

            if (admin.Account != null)
                admin.Account.Password = _passwordHasher.HashPassword(admin.Account.Password);

            if (await _adminRepository.AddAdminAsync(admin))
            {
                return await GetAdministratorByIdAsync(admin.AdminID);
            }

            return null;
        }

        public async Task<bool> DeleteAdministratorAsync(int adminID)
        {
            return await _adminRepository.DeleteAdminAsync(adminID);
        }

        public async Task<AdministratorResponse?> GetAdministratorByIdAsync(int adminID)
        {
            var admin = await _adminRepository.GetAdminByIDAsync(adminID);
            return admin?.ToResponse() ?? null;
        }

        public async Task<bool> UpdateAdministratorAsync(int adminID, UpdateAdministratorRequest request)
        {
            _ValidationService.Validate(request);

            var admin = request.ToAdministrator(adminID);

            if (admin != null)
            {
                return await _adminRepository.UpdateAdminAsync(admin);
            }

            return false;
        }

        public async Task<IEnumerable<AdministratorResponse>> GetPageAdministratorsAsync(int pageNumber = 1, int pageSize = 10)
        {
            var admins = await _adminRepository.GetPageAdminsAsync(pageNumber, pageSize);

            var responses = admins?.Select(admin => admin.ToResponse()).Where(adm => adm != null);

            return responses?.Select(response => response!).ToList() ?? new List<AdministratorResponse>();
        }

        public async Task<AdministratorResponse?> GetAdminByAccountIDAsync(int accountID)
        {
            var admin = await _adminRepository.GetAdminByAccountIDAsync(accountID);
            return admin?.ToResponse() ?? null;
        }
    }
}
