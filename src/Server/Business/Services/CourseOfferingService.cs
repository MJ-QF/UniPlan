using Business.DTOs.Requests.Create;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;
using Business.Interfaces;
using Business.Mapper;
using Core.Entities;
using Core.Interfaces.ExternalServices;
using Core.Interfaces.Repositories;

namespace Business.Services
{
    public class CourseOfferingService : ICourseOfferingService
    {
        private readonly ICourseOfferingRepository _offeringRepository;
        private readonly IValidationService _validationService;

        public CourseOfferingService(ICourseOfferingRepository offeringRepository, IValidationService validationService)
        {
            _validationService = validationService;
            _offeringRepository = offeringRepository;
        }

        public async Task<bool> DeleteCourseOfferingAsync(int offeringID)
        {
            return offeringID > 0 && await _offeringRepository.DeleteCourseOfferingAsync(offeringID);
        }


        public async Task<bool> AddCourseOfferingsAsync(CreateCourseOfferingRequest request)
        {
            _validationService.Validate(request);

            CourseOffering offering = request.ToCourseOffering();

            bool res = await _offeringRepository.AddCourseOfferingsAsync(offering, request.NumberOfSections);

            return res;
        }

        public async Task<bool> UpdateCourseOfferingAsync(UpdateCourseOfferingRequest request, int offeringID)
        {
            _validationService.Validate(request);

            CourseOffering? offering = await _offeringRepository.GetCourseOfferingByIDAsync(offeringID);

            offering?.UpdateOffering(request);

            if (offering != null)
                return await _offeringRepository.UpdateCourseOfferingAsync(offering);

            return false;
        }

        public async Task<IEnumerable<CourseOfferingResponse>?> SearchCourseOfferingsAsync( int? termID = null, string? courseName = null, int pageNumber = 1, int pageSize = 10)
        {
            IEnumerable<CourseOffering>? offerings = await _offeringRepository.SearchCourseOfferingsAsync(termID, courseName, pageNumber, pageSize);

            return offerings?.Select(m => m.ToResponse()).OfType<CourseOfferingResponse>();
        }

        public async Task<CourseOfferingResponse?> GetCourseOfferingByIDAsync(int offeringID)
        {
            if (offeringID <= 0)
                return null;

            CourseOffering? _offering = await _offeringRepository.GetCourseOfferingByIDAsync(offeringID);
            return _offering != null ? _offering.ToResponse() : null;
        }
    }
}
