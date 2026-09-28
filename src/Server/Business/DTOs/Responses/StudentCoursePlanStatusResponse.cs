namespace Business.DTOs.Responses
{
    public class StudentCoursePlanStatusResponse
    {
        public CourseResponse Course { get; set; } = null!;

        public string? Status { get; set; }

        public List<string?>? CoursePrerequisitesCodes { get; set; }
    }
}
