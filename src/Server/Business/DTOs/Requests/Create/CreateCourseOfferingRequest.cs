using Infrastructure.ExternalServices.Validation.Attributes;

namespace Business.DTOs.Requests.Create
{
    public class CreateCourseOfferingRequest
    {
        [Required<int>("عدد الأقسام مطلوب")]
        [Range<int>("يجب أن يكون عدد الأقسام أكبر من 0", 1, int.MaxValue)]
        public int NumberOfSections { get; set; }

        [Required<int>("معرف الفصل الأكاديمي مطلوب")]
        [Range<int>("يجب أن يكون المعرف أكبر من 0", 1, int.MaxValue)]
        public int TermID { get; set; }

        [Required<int>("نوع المحاضرة مطلوبة")]
        [AllowedValues("يجب أن تكون قيمة نوع المحاضرة 1 (النظري) أو 2 (العملي) أو 3 (TD) فقط", new object[] { 1, 2, 3 })]
        public int LectureType { get; set; }

        [Required<int>("معرف الأدمن المنشئ مطلوب")]
        [Range<int>("يجب أن يكون المعرف أكبر من 0", 1, int.MaxValue)]
        public int CreatedByAdminID { get; set; }

        [Required<int>("معرف الكورس مطلوب")]
        [Range<int>("يجب أن يكون المعرف أكبر من 0", 1, int.MaxValue)]
        public int CourseID { get; set; }

        public CreateCourseOfferingRequest()
        {
            CreatedByAdminID = default;
            NumberOfSections = default;
            TermID = default;
            LectureType = default;
            CourseID = default;
        }

        public CreateCourseOfferingRequest(int numberOfSections
            , int termID, int lectureID, int createdByAdminID, int courseID)
        {
            NumberOfSections = numberOfSections;
            TermID = termID;
            LectureType = lectureID;
            CreatedByAdminID = createdByAdminID;
            CourseID = courseID;
        }
    }
}