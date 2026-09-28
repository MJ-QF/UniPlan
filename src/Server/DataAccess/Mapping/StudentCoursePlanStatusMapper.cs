using Core.Entities;
using DataAccess.Extensions;
using Microsoft.Data.SqlClient;

namespace DataAccess.Mapping
{
    public static class StudentCoursePlanStatusMapper
    {
        public static StudentCoursePlanStatus ToStudentCoursePlanStatus(this SqlDataReader reader)
        {
            Course course = reader.ToCourse();
            reader.ReadString("Status", out string status, string.Empty);
            reader.ReadString("PrerequisiteCourseCode", out string prerequisiteCourseCode, string.Empty);

            return new StudentCoursePlanStatus { Course = course, Status = status , PrerequisiteCourseCode = prerequisiteCourseCode };
        }
    }
}
