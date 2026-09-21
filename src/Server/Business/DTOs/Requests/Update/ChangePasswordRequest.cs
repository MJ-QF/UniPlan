using Infrastructure.ExternalServices.Validation.Attributes;
using Infrastructure.ExternalServices.Validation.Enums;

namespace Business.DTOs.Requests.Update
{
    public class ChangePasswordRequest
    {

        [Required<string>("كلمة المرور الجديدة مطلوبة")]
        [Length("يجب أن تكون كلمة المرور بين 8 و 50 حرفًا", 50, 8)]
        [Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$", "يجب أن تحتوي كلمة المرور على حرف كبير وحرف صغير ورقم")]
        public string? NewPassword { get; set; }

        [Required<string>("كلمة المرور القديمة مطلوبة")]
        [Length("يجب أن تكون كلمة المرور بين 8 و 50 حرفًا", 50, 8)]
        [Compare(nameof(NewPassword), ComparisonType.NotEqual, "يجب أن تكون كلمة المرور الجديدة مختلفة عن القديمة")]
        public string? OldPassword { get; set; }

    }
}