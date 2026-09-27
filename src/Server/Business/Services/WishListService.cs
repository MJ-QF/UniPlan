using Business.DTOs.Requests;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;
using Business.Interfaces;
using Business.Mapper;
using Core.Entities;
using Core.Interfaces.ExternalServices;

namespace Business.Services
{
    public class WishListService : IWishListService
    {
        private readonly IWishListRepository _listRepository;
        private readonly IValidationService _validationService;

        public WishListService(IWishListRepository listRepository, IValidationService validationService)
        {
            _validationService = validationService;
            _listRepository = listRepository;
        }

        public async Task<bool> DeleteWishListAsync(int listID)
        {
            return listID > 0 && await _listRepository.DeleteWishListAsync(listID);
        }

        public async Task<WishListResponse?> AddWishListAsync(WishListRequest request)
        {
            _validationService.Validate(request);

            WishList list = request.ToWishList();

            list.WishListID = await _listRepository.AddWishListAsync(list);

            if (list.WishListID != -1)
                return await GetWishListByIDAsync(list.WishListID);

            return null;
        }

        public async Task<IEnumerable<WishListResponse>?> GetWishListsByStudentIDAsync(int studentID, int pageNumber = 1, int pageSize = 10)
        {
            IEnumerable<WishList>? lists = await _listRepository.GetWishListsByStudentIDAsync(studentID, pageNumber, pageSize);
            return lists?.Select(m => m.ToResponse()).OfType<WishListResponse>();
        }

        public async Task<WishListResponse?> GetWishListByIDAsync(int listID)
        {
            if (listID <= 0)
                return null;

            WishList? list = await _listRepository.GetWishListByIDAsync(listID);
            return list != null ? list.ToResponse() : null;
        }

        public async Task<bool> SyncCoursesAsync(int listID , SyncCoursesRequest coursesRequest)
        {
            WishList list = coursesRequest.ToWishList(listID);
            return await _listRepository.SyncCoursesAsync(list);
        }
    }
}
