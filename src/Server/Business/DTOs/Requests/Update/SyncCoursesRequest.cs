namespace Business.DTOs.Requests.Update
{
    public class SyncCoursesRequest
    {
        public List<int> CourseIds { get; set; }


        public SyncCoursesRequest(List<int> passedCourseIds)
        {
            CourseIds = passedCourseIds;
        }
        public SyncCoursesRequest()
        {
            CourseIds = new List<int>();
        }
    }
}
