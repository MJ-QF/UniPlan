using Business.DTOs.Responses;
using Core.Entities;


namespace Business.Mapper
{
    public static class StudentCoursePlanStatusMapper
    {
        public static IEnumerable<StudentCoursePlanStatusResponse> ToResponseList(
            this IEnumerable<StudentCoursePlanStatus> rawList)
        {
            return rawList
                .GroupBy(x => x.Course.CourseID)
                .Select(group =>
                {
                    var firstItem = group.First();

                    return new StudentCoursePlanStatusResponse
                    {
                        Course = firstItem.Course.ToResponse(),
                        Status = firstItem.Status,
                        CoursePrerequisitesIDs = group
                            .Where( x => x.Course.CourseID == firstItem.Course.CourseID && x.PrerequisiteCourseID != -1)
                            .Select(x => x.PrerequisiteCourseID)
                            .ToList()
                    };
                });
        }
    }
}