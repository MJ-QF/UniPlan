using Core.Entities;

namespace Core.Interfaces.Repositories
{
    public interface IAdminRepository
    {
        Task<bool> DeleteAdminAsync(int AdminID);

        Task<bool> AddAdminAsync(Administrator Admin);

        Task<bool> UpdateAdminAsync(Administrator Admin);

        Task<IReadOnlyCollection<Administrator>?> GetPageAdminsAsync(int pageNumber, int pageSize);

        Task<Administrator?> GetAdminByIDAsync(int AdminID);

        Task<Administrator?> GetAdminByAccountIDAsync(int accountID);

    }
}
