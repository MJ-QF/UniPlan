using Infrastructure.ExternalServices.Validation.Attributes;
using Infrastructure.ExternalServices.Validation.Enums;

namespace Business.DTOs.Requests
{
    public class GeneratedScheduleRequest
    {
        [Required<int>("معرف قائمة الرغبات مطلوب")]
        [Range<int>("يجب أن يكون المعرف أكبر من 0", 1, int.MaxValue)]
        public int WishListID { get; set; }

        [Required<object>("يجب تحديد أيام الأسبوع")]
        [Range<int>("يجب أن تكون قيمة اليوم بين 0 للأحد و 6 للسبت", 0, 6)]
        public List<int> Days { get; set; }

        [Required<TimeSpan>("الفترة مطلوبة")]
        public TimeSpan StartTime { get; set; }

        [Required<TimeSpan>("الفترة مطلوبة")]
        [Compare(nameof(StartTime), ComparisonType.GreaterThan, "يجب ان تكون الفنرة الثانية اكبر من الفترة الاولى")]
        public TimeSpan EndTime { get; set; }

        public GeneratedScheduleRequest(int wishListID, List<int> days)
        {
            WishListID = wishListID;
            Days = days;
        }
    }
}