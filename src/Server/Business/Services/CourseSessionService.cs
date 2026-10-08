using Business.DTOs.Requests.Create;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;
using Business.Interfaces;
using Business.Mapper;
using Core.Entities;
using Core.Exceptions;
using Core.Interfaces.ExternalServices;
using Core.Interfaces.Repositories;

namespace Business.Services
{
    public class CourseSessionService : ICourseSessionService
    {
        private ICourseSessionRepository _courseSessionRepository;
        private IValidationService _ValidationService;

        public CourseSessionService(ICourseSessionRepository courseSessionRepository, IValidationService validationService)
        {
            _courseSessionRepository = courseSessionRepository;
            _ValidationService = validationService;
        }

        public async Task<bool> DeleteCourseSessionAsync(int courseSessionID)
        {
            return await _courseSessionRepository.DeleteCourseSessionAsync(courseSessionID);
        }

        public async Task<CourseSessionResponse?> AddCourseSessionAsync(CreateCourseSessionRequest request)
        {
            _ValidationService.Validate(request);

            CourseSession? courseSession = request!.ToCourseSession();

            courseSession.SessionID = await _courseSessionRepository.AddCourseSessionAsync(courseSession);

            if (courseSession.SessionID != -1)
            {
                courseSession = await _courseSessionRepository.GetCourseSessionByIDAsync(courseSession.SessionID);

                return courseSession?.ToResponse() ?? null;
            }
            return null;
        }

        public async Task<bool> UpdateCourseSessionAsync(UpdateCourseSessionRequest request, int courseSessionID)
        {
            _ValidationService.Validate(request);

            CourseSession? courseSession = await _courseSessionRepository.GetCourseSessionByIDAsync(courseSessionID);

            courseSession?.UpdateCourseSession(request);

            if (courseSession != null)
                return await _courseSessionRepository.UpdateCourseSessionAsync(courseSession);

            return false;
        }

        public async Task<IEnumerable<CourseSessionResponse>?> GetPagedCourseSessionsAsync(int pageNumber = 1, int pageSize = 10)
        {
            IEnumerable<CourseSession?>? courseSessions = await _courseSessionRepository.GetCourseSessionsPagedAsync(pageNumber, pageSize);
            return courseSessions?.Select(m => m?.ToResponse() ?? null).OfType<CourseSessionResponse>();
        }

        public async Task<CourseSessionResponse?> GetCourseSessionByIDAsync(int courseSessionID)
        {
            CourseSession? courseSession = await _courseSessionRepository.GetCourseSessionByIDAsync(courseSessionID);
            return courseSession != null ? courseSession.ToResponse() : null;
        }

        public async Task<Dictionary<int, Dictionary<int, List<CourseSession>>>?> GetWishlistSessionsByTimeSlotAsync(int listID, List<int> days, TimeSpan startTime, TimeSpan endTime)
        {
            var availableSessionsMap =  await _courseSessionRepository.GetWishlistSessionsByTimeSlotAsync(listID, days, startTime, endTime);

            if (availableSessionsMap == null || availableSessionsMap.Count == 0)
                return null;

            HashSet<string> unavailableLecturesForDays = new();

            foreach (var item in availableSessionsMap.Keys)
            {
                if(availableSessionsMap[item].Keys.Contains(0))
                {
                    var session = availableSessionsMap[item]?.FirstOrDefault().Value?.FirstOrDefault();
                    unavailableLecturesForDays.Add(session?.CourseOffering?.Lecture?.ToString() ?? string.Empty);
                }
            }

            if (unavailableLecturesForDays.Count > 0)
            {
                throw new ValidationException($"هناك محاضرات غير موجودة بالأوقات التي تريدها عدد محاضرات: {unavailableLecturesForDays.Count}\n" + string.Join("\n", unavailableLecturesForDays));
            }

            return availableSessionsMap;
        }
    }
}
