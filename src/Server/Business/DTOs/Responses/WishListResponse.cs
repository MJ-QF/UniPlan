namespace Business.DTOs.Responses
{
    public class WishListResponse
    {
        public int WishListID { get; set; }

        public StudentTermResponse RegistrationInfo { get; set; }

        public bool AllowUpdate { get; set; }

        public WishListResponse()
        {
            RegistrationInfo = new StudentTermResponse();
        }

        public WishListResponse(int wishListID, StudentTermResponse registrationInfo, bool allowUpdate)
        {
            WishListID = wishListID;
            RegistrationInfo = registrationInfo;
            AllowUpdate = allowUpdate;
        }
    }
}
