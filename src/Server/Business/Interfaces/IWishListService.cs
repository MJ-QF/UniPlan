using Business.DTOs.Requests;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;

namespace Business.Interfaces
{
    public interface IWishListService
    {
        Task<bool> DeleteWishListAsync(int listID);

        Task<WishListResponse?> AddWishListAsync(WishListRequest list);

        Task<IEnumerable<WishListResponse>?> GetWishListsByStudentIDAsync(int studentID, int pageNumber = 1, int pageSize = 10);

        Task<WishListResponse?> GetWishListByIDAsync(int listID);

        Task<bool> SyncCoursesAsync(int listID, SyncCoursesRequest coursesRequest);
    }
}
