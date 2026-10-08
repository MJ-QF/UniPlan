using Business.DTOs.Requests;
using Business.DTOs.Responses;
using Business.Interfaces;
using Business.Mapper;
using Core.Entities;
using Core.Exceptions;
using Core.Interfaces.ExternalServices;
using Core.Interfaces.Repositories;
using Core.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Services
{
    public class GeneratedScheduleService : IGeneratedScheduleService
    {
        private readonly IGeneratedScheduleRepository _scheduleRepository;
        private readonly IValidationService _validationService;
        private readonly ICourseSessionService _courseSessionService;

        public GeneratedScheduleService(IGeneratedScheduleRepository scheduleRepository, IValidationService validationService, ICourseSessionService courseSessionService)
        {
            _courseSessionService = courseSessionService;
            _validationService = validationService;
            _scheduleRepository = scheduleRepository;
        }

        public async Task<GeneratedScheduleResponse?> AddGeneratedScheduleAsync(GeneratedScheduleRequest request)
        {
            _validationService.Validate(request);

            GeneratedSchedule schedule = request.ToGeneratedSchedule();

            if (await _GeneratedSchedule(schedule, request.Days, request.StartTime, request.EndTime) && await _scheduleRepository.AddGeneratedScheduleAsync(schedule))
                return await GetGeneratedScheduleByWishListIDAsync(schedule.WishList.WishListID);

            return null;
        }

        private async Task<bool> _GeneratedSchedule(GeneratedSchedule schedule, List<int> days, TimeSpan startTime, TimeSpan endTime)
        {
            var availableSessionsMap = await _courseSessionService.GetWishlistSessionsByTimeSlotAsync(schedule.WishList.WishListID, days, startTime, endTime);

            if (availableSessionsMap == null || availableSessionsMap.Count == 0)
                return false;

            List<int> lectures = availableSessionsMap.Keys.ToList();
            HashSet<string> conflictMeesages = new HashSet<string>();

            schedule.GeneratedCombinations = _GetAllSchedules(availableSessionsMap, new(), new(), lectures, conflictMeesages);


            if (schedule.GeneratedCombinations.Count == 0)
            {
                string conflictMessage = string.Join("\n", conflictMeesages.Select((c, i) => $"التعارض رقم: {i + 1}\n{c}"));
                throw new ConflictException($"لا يمكنك توليد جدولك الجامعي بسبب وجود تعارضات عددعم: {conflictMeesages.Count}\n" + conflictMessage);
            }

            return true;
        }

        private List<ScheduleManager> _GetAllSchedules(Dictionary<int, Dictionary<int, List<CourseSession>>> availableSessionsMap, ScheduleManager schedule, List<ScheduleManager> schedules, List<int> lectures, HashSet<string> conflictMeesages, int lectureIndex = 0)
        {
            if(lectureIndex == lectures.Count)
            {
                schedules.Add(new ScheduleManager(schedule));
                return schedules;
            }

            int lectureID = lectures[lectureIndex];

            foreach (int offeringID in availableSessionsMap[lectureID].Keys)
            {
                List<CourseSession> sessions = availableSessionsMap[lectureID][offeringID];

                if(schedule.TryAdd(sessions))
                {
                    _GetAllSchedules(availableSessionsMap, schedule, schedules, lectures, conflictMeesages,lectureIndex + 1);
                    schedule.Remove(sessions);
                }
                else if(schedule.ConflictMeesage != null)
                {
                    conflictMeesages.Add(schedule.ConflictMeesage);
                }
            }

            return schedules;
        }

        public async Task<GeneratedScheduleResponse?> GetGeneratedScheduleByWishListIDAsync(int listID)
        {
            if (listID <= 0)
                return null;

            GeneratedSchedule? schedule = await _scheduleRepository.GetGeneratedScheduleByWishListIDAsync(listID);
            return schedule != null ? schedule.ToResponse() : null;
        }

        public async Task<ScheduleDetailResponse?> GetScheduleDetailByWishListIDAsync(int listID, int scheduleNum)
        {
            if (listID <= 0 || scheduleNum <= 0)
                return null;

            GeneratedSchedule? schedule = await _scheduleRepository.GetScheduleDetailByWishListIDAsync(listID, scheduleNum);
            return schedule != null ? schedule.ToScheduleDetailResponse() : null;
        }

        public async Task<IEnumerable<GeneratedScheduleResponse>?> GetSchedulesByStudentIDAsync(int studentID, int pageNumber = 1, int pageSize = 10)
        {
            IEnumerable<GeneratedSchedule>? schedules = await _scheduleRepository.GetSchedulesByStudentIDAsync(studentID, pageNumber, pageSize);
            return schedules?.Select(m => m?.ToResponse() ?? null).OfType<GeneratedScheduleResponse>();
        }
    }
}
