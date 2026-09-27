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
            reader.ReadInt("PrerequisiteCourseID", out int coursePrerequisiteId, -1);

            return new StudentCoursePlanStatus { Course = course, Status = status , PrerequisiteCourseID = coursePrerequisiteId };
        }
    }
}
