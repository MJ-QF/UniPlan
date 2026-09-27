using Core.Entities;

namespace Business.Interfaces
{
    public interface IWishListRepository
    {
        Task<bool> DeleteWishListAsync(int listID);

        Task<int> AddWishListAsync(WishList list);

        Task<IEnumerable<WishList>?> GetWishListsByStudentIDAsync(int studentID, int pageNumber = 1, int pageSize = 10);

        Task<WishList?> GetWishListByIDAsync(int listID);

        Task<bool> SyncCoursesAsync(WishList list);
    }
}
