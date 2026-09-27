namespace Core.Entities
{
    public class StudentCoursePlanStatus
    {
        public Course Course { get; set; } = null!;

        public string? Status { get; set; }

        public int PrerequisiteCourseID { get; set; }
    }
}
