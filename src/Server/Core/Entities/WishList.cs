namespace Core.Entities
{
    public class WishList
    {
        public int WishListID { get; set; }

        public StudentTerm StudentTerm { get; set; }

        public List<int>? CourseIDs { get; set; }

        public bool AllowUpdate { get; set; }


        public WishList(int wishListID, StudentTerm studentTerm, List<int>? coursesIDs)
        {
            WishListID = wishListID;
            StudentTerm = studentTerm;
            CourseIDs = coursesIDs;
        }

        public WishList(int wishListID)
        {
            WishListID = wishListID;
            StudentTerm = new StudentTerm();
        }

        public WishList()
        {
            WishListID = -1;
            StudentTerm = new StudentTerm();
        }
    }
}
