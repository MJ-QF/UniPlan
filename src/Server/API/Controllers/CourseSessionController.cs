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
    [Route("api/courseSessions")]
    [ApiController]
    public class CourseSessionController : ControllerBase
    {
        private readonly ICourseSessionService _courseSessionService;
        private readonly ILogService _logService;
        private readonly IExceptionService _exceptionService;

        public CourseSessionController(ICourseSessionService coursesService, ILogService logService, IExceptionService exceptionService)
        {
            _courseSessionService = coursesService;
            _logService = logService;
            _exceptionService = exceptionService;
        }

        [HttpPost(Name = "AddCourseSessionAsync")]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(CourseSessionResponse))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status422UnprocessableEntity, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult<CourseSessionResponse>> AddCourseSessionAsync(CreateCourseSessionRequest request)
        {
            try
            {
                var result = await _courseSessionService.AddCourseSessionAsync(request);

                if (result != null)
                {
                    await _logService.LogAsync("Course Session added successfully.", ExternalServicesEnums.LogType.Info);
                    return CreatedAtRoute("GetCourseSessionByIdAsync", new { courseSessionID = result.SessionID }, result);
                }

                await _logService.LogAsync("Failed to add Course Session.", ExternalServicesEnums.LogType.Warning);
                return BadRequest("فشل في إضافة جلسة الدورة.");
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

        [HttpPut("{courseSessionID}", Name = "UpdateCourseSessionAsync")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status422UnprocessableEntity, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult> UpdateCourseSessionAsync(int courseSessionID, UpdateCourseSessionRequest request)
        {
            try
            {
                if (courseSessionID > 0)
                {
                    var result = await _courseSessionService.UpdateCourseSessionAsync(request, courseSessionID);

                    if (result)
                    {
                        await _logService.LogAsync($"Course Session with ID {courseSessionID} updated successfully.", ExternalServicesEnums.LogType.Info);
                        return NoContent();
                    }
                }
                await _logService.LogAsync($"Failed to update Course Session with ID {courseSessionID}.", ExternalServicesEnums.LogType.Warning);
                return BadRequest($"فشل في تحديث جلسة الدورة ذات المعرف {courseSessionID}.");
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

        [HttpDelete("{courseSessionID}", Name = "DeleteCourseSessionAsync")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult> DeleteCourseSessionAsync(int courseSessionID)
        {
            try
            {
                if (courseSessionID > 0)
                {
                    bool result = await _courseSessionService.DeleteCourseSessionAsync(courseSessionID);

                    if (result)
                    {
                        await _logService.LogAsync($"Course Session with ID {courseSessionID} deleted successfully.", ExternalServicesEnums.LogType.Info);
                        return NoContent();
                    }
                }

                await _logService.LogAsync($"Failed to delete Course Session with ID {courseSessionID}.", ExternalServicesEnums.LogType.Warning);
                return BadRequest($"فشل في حذف جلسة الدورة ذات المعرف {courseSessionID}.");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _exceptionService.GetExceptionMessage(ex));
            }
        }

        [HttpGet("{courseSessionID}", Name = "GetCourseSessionByIdAsync")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CourseSessionResponse))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        public async Task<ActionResult<CourseSessionResponse>> GetCourseSessionByIdAsync(int courseSessionID)
        {
            try
            {
                if (courseSessionID > 0)
                {
                    CourseSessionResponse? response = await _courseSessionService.GetCourseSessionByIDAsync(courseSessionID);

                    if (response != null)
                    {
                        await _logService.LogAsync($"Course Session with ID {courseSessionID} fetched successfully.", ExternalServicesEnums.LogType.Info);
                        return Ok(response);
                    }
                }
                else return BadRequest("يجب أن يكون المعرف أكبر من 0");

                await _logService.LogAsync($"Course Session with ID {courseSessionID} was not found.", ExternalServicesEnums.LogType.Warning);
                return NotFound($"جلسة الدورة ذات المعرف {courseSessionID} غير موجودة.");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _exceptionService.GetExceptionMessage(ex));
            }
        }

        [HttpGet(Name = "SearchCourseSessionsAsync")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<CourseSessionResponse>))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        public async Task<ActionResult<IEnumerable<CourseSessionResponse>>> SearchCourseSessionsAsync([FromQuery] int termID, [FromQuery] int dayNum, [FromQuery] string? courseName = null)
        {
            try
            {
                if (dayNum >= 0 && dayNum <= 6)
                {
                    IEnumerable<CourseSessionResponse>? responses = await _courseSessionService.SearchCourseSessionsAsync(termID, dayNum, courseName);

                    if (responses != null && responses.Any())
                    {
                        await _logService.LogAsync($"Course Sessions fetched successfully for day {dayNum}.", ExternalServicesEnums.LogType.Info);
                        return Ok(responses);
                    }
                }
                else return BadRequest();

                await _logService.LogAsync($"No course Sessions found on day {dayNum}.", ExternalServicesEnums.LogType.Warning);
                return Ok(new List<CourseSessionResponse>());
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _exceptionService.GetExceptionMessage(ex));
            }
        }

    }
}