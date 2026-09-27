using Business.DTOs.Requests;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;
using Core.Entities;

namespace Business.Mapper
{
    public static class WishListMapper
    {
        public static WishList ToWishList(this WishListRequest request)
        {
            AcademicTerm term = new AcademicTerm(request.AcademicTermID);

            return new WishList(-1, new StudentTerm { StudentID = request.StudentID , AcademicTerm = term } , request.CoursesIDs);
        }

        public static WishList ToWishList(this SyncCoursesRequest request, int listID)
        {
            return new WishList { WishListID = listID, CourseIDs = request.CourseIds };
        }

        public static WishListResponse ToResponse(this WishList wishList)
        {
            StudentTermResponse studentTerm = wishList.StudentTerm.ToResponse();
            return new WishListResponse(wishList.WishListID, studentTerm, wishList.AllowUpdate);
        }
    }
}
