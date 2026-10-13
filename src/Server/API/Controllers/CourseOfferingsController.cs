using Business.DTOs.Requests.Create;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;
using Business.Interfaces;
using Core.Enums;
using Core.Exceptions;
using Core.Interfaces.ExternalServices;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace API.Controllers
{
    [Route("api/courseOfferings")]
    [ApiController]
    public class CourseOfferingsController : ControllerBase
    {
        private readonly ICourseOfferingService _offeringService;
        private readonly ILogService _logService;
        private readonly IExceptionService _exceptionService;

        public CourseOfferingsController(ICourseOfferingService offeringService, ILogService logService, IExceptionService exceptionService)
        {
            _offeringService = offeringService;
            _logService = logService;
            _exceptionService = exceptionService;
        }

        [HttpPost(Name = "AddCourseOfferingsAsync")]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status422UnprocessableEntity, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult> AddCourseOfferingsAsync(CreateCourseOfferingRequest request)
        {
            try
            {
                bool res = await _offeringService.AddCourseOfferingsAsync(request);

                if (res)
                {
                    await _logService.LogAsync("تم إضافة الشعب بنجاح", ExternalServicesEnums.LogType.Info);
                    return StatusCode(StatusCodes.Status201Created, "تم إضافة الشعب بنجاح");
                }

                await _logService.LogAsync("فشل إضافة الشعب بسبب خطأ في الخادم", ExternalServicesEnums.LogType.Warning);
                return StatusCode(StatusCodes.Status500InternalServerError, "فشل إضافة الشعب");
            }
            catch (SqlException sqlException) when (sqlException.Number > 50000)
            {
                return Conflict(_exceptionService.GetExceptionMessage(sqlException));
            }
            catch (ValidationException valException)
            {
                await _logService.LogAsync(valException.Message, ExternalServicesEnums.LogType.Error);
                return UnprocessableEntity(valException.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _exceptionService.GetExceptionMessage(ex));
            }
        }

        [HttpPut("{offeringID}", Name = "UpdateCourseOfferingAsync")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status422UnprocessableEntity, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult> UpdateCourseOfferingAsync(int offeringID, UpdateCourseOfferingRequest request)
        {
            try
            {
                bool res = await _offeringService.UpdateCourseOfferingAsync(request, offeringID);

                if (res)
                {
                    await _logService.LogAsync("تم تحديث عرض المقرر بنجاح", ExternalServicesEnums.LogType.Info);
                    return NoContent();
                }

                await _logService.LogAsync($"لم يتم العثور على عرض المقرر بالمعرف {offeringID}", ExternalServicesEnums.LogType.Warning);
                return NotFound($"لم يتم العثور على عرض المقرر بالمعرف {offeringID}");
            }
            catch (SqlException sqlException) when (sqlException.Number > 50000)
            {
                return Conflict(_exceptionService.GetExceptionMessage(sqlException));
            }
            catch (ValidationException valException)
            {
                await _logService.LogAsync(valException.Message, ExternalServicesEnums.LogType.Error);
                return UnprocessableEntity(valException.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _exceptionService.GetExceptionMessage(ex));
            }
        }

        [HttpDelete("{offeringID}", Name = "DeleteCourseOfferingAsync")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult> DeleteCourseOfferingAsync(int offeringID)
        {
            try
            {
                bool res = await _offeringService.DeleteCourseOfferingAsync(offeringID);

                if (res)
                {
                    await _logService.LogAsync("تم حذف عرض المقرر بنجاح", ExternalServicesEnums.LogType.Info);
                    return NoContent();
                }

                await _logService.LogAsync($"لم يتم العثور على عرض المقرر بالمعرف {offeringID}", ExternalServicesEnums.LogType.Warning);
                return NotFound($"لم يتم العثور على عرض المقرر بالمعرف {offeringID}");
            }
            catch (SqlException sqlException) when (sqlException.Number > 50000)
            {
                return Conflict(_exceptionService.GetExceptionMessage(sqlException));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _exceptionService.GetExceptionMessage(ex));
            }
        }

        [HttpGet("{offeringID}", Name = "GetCourseOfferingByIDAsync")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CourseOfferingResponse))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult<CourseOfferingResponse>> GetCourseOfferingByIDAsync(int offeringID)
        {
            try
            {
                CourseOfferingResponse? response = await _offeringService.GetCourseOfferingByIDAsync(offeringID);

                if (response != null)
                {
                    await _logService.LogAsync($"تم جلب عرض المقرر بالمعرف {offeringID} بنجاح", ExternalServicesEnums.LogType.Info);
                    return Ok(response);
                }

                await _logService.LogAsync($"لم يتم العثور على عرض المقرر بالمعرف {offeringID}", ExternalServicesEnums.LogType.Warning);
                return NotFound($"لم يتم العثور على عرض المقرر بالمعرف {offeringID}");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _exceptionService.GetExceptionMessage(ex));
            }
        }

        [HttpGet(Name = "SearchCourseOfferingsAsync")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<CourseOfferingResponse>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult<IEnumerable<CourseOfferingResponse>>> SearchCourseOfferingsAsync(
            [FromQuery] int? termID = null,
            [FromQuery] string? courseName = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            if (pageNumber <= 0 || pageSize <= 0)
            {
                return BadRequest("يجب أن يكون رقم الصفحة وحجم الصفحة أكبر من 0");
            }

            try
            {
                IEnumerable<CourseOfferingResponse>? responses = await _offeringService.SearchCourseOfferingsAsync(termID, courseName, pageNumber, pageSize);

                await _logService.LogAsync($"تم جلب عروض المقررات للصفحة {pageNumber} بحجم {pageSize} بنجاح", ExternalServicesEnums.LogType.Info);
                return Ok(responses ?? Enumerable.Empty<CourseOfferingResponse>());
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _exceptionService.GetExceptionMessage(ex));
            }
        }
    }
}