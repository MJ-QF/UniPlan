using Infrastructure.ExternalServices.Validation.Attributes;

namespace Business.DTOs.Requests
{
    public class WishListRequest
    {
        [Required<int>("معرف الطالب مطلوب")]
        [Range<int>("يجب أن يكون المعرف أكبر من 0", 1, int.MaxValue)]
        public int StudentID { get; set; }

        [Required<int>("معرف الفصل الدراسي مطلوب")]
        [Range<int>("يجب ان يكون المعرف اكبر تماما من 0", 1, int.MaxValue)]
        public int AcademicTermID { get; set; }

        public List<int>? CoursesIDs { get; set; }

    }
}