using Business.DTOs.Requests.Create;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;
using Business.Interfaces;
using Core.Entities;
using Core.Enums;
using Core.Exceptions;
using Core.Interfaces.ExternalServices;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace API.Controllers
{
    [Route("api/students")]
    [ApiController]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentService _studentService;
        private readonly ILogService _logService;
        private readonly IExceptionService _exceptionService;
        private readonly IStudentTermService _studentTermService;
        private readonly IStudentCourseService _studentCourseService;

        public StudentsController(IStudentService studentService, ILogService logService, IExceptionService exceptionService, IStudentTermService studentTermService, IStudentCourseService studentCourseService)
        {
            _studentService = studentService;
            _logService = logService;
            _exceptionService = exceptionService;
            _studentTermService = studentTermService;
            _studentCourseService = studentCourseService;
        }

        [HttpPost(Name = "AddStudentAsync")]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(StudentResponse))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status422UnprocessableEntity, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult<StudentResponse?>> AddStudentAsync(CreateStudentRequest request)
        {
            try
            {
                StudentResponse? response = await _studentService.AddStudentAsync(request);

                if (response != null)
                {
                    await _logService.LogAsync("تم إضافة الطالب بنجاح", ExternalServicesEnums.LogType.Info);
                    return CreatedAtRoute("GetStudentByIDAsync", new { studentID = response.StudentID }, response);
                }

                await _logService.LogAsync("فشل إضافة الطالب بسبب خطأ في الخادم", ExternalServicesEnums.LogType.Warning);
                return StatusCode(StatusCodes.Status500InternalServerError, "فشل إضافة الطالب");
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

        [HttpPut("{studentID}", Name = "UpdateStudentAsync")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status422UnprocessableEntity, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult> UpdateStudentAsync(int studentID, UpdateStudentRequest request)
        {
            try
            {
                bool res = await _studentService.UpdateStudentAsync(request, studentID);

                if (res)
                {
                    await _logService.LogAsync("تم تحديث الطالب بنجاح", ExternalServicesEnums.LogType.Info);
                    return NoContent();
                }

                await _logService.LogAsync($"لم يتم العثور على الطالب بالمعرف {studentID}", ExternalServicesEnums.LogType.Warning);
                return NotFound($"لم يتم العثور على الطالب بالمعرف {studentID}");
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

        [HttpDelete("{studentID}", Name = "DeleteStudentAsync")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult> DeleteStudentAsync(int studentID)
        {
            try
            {
                bool res = await _studentService.DeleteStudentAsync(studentID);

                if (res)
                {
                    await _logService.LogAsync("تم حذف الطالب بنجاح", ExternalServicesEnums.LogType.Info);
                    return NoContent();
                }

                await _logService.LogAsync($"لم يتم العثور على الطالب بالمعرف {studentID}", ExternalServicesEnums.LogType.Warning);
                return NotFound($"لم يتم العثور على الطالب بالمعرف {studentID}");
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

        [HttpGet("{studentID}", Name = "GetStudentByIDAsync")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(StudentResponse))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult<StudentResponse>> GetStudentByIDAsync(int studentID)
        {
            try
            {
                StudentResponse? response = await _studentService.GetStudentByIDAsync(studentID);

                if (response != null)
                {
                    await _logService.LogAsync($"تم جلب الطالب بالمعرف {studentID} بنجاح", ExternalServicesEnums.LogType.Info);
                    return Ok(response);
                }

                await _logService.LogAsync($"لم يتم العثور على الطالب بالمعرف {studentID}", ExternalServicesEnums.LogType.Warning);
                return NotFound($"لم يتم العثور على الطالب بالمعرف {studentID}");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _exceptionService.GetExceptionMessage(ex));
            }
        }

        [HttpGet(Name = "GetPagedStudentsAsync")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<StudentResponse>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult<IEnumerable<StudentResponse>>> GetPagedStudentsAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageNumber <= 0 || pageSize <= 0)
            {
                return BadRequest("يجب أن يكون رقم الصفحة وحجم الصفحة أكبر من 0");
            }

            try
            {
                IEnumerable<StudentResponse>? responses = await _studentService.GetPagedStudentsAsync(pageNumber, pageSize);

                if (responses == null)
                {
                    responses = Enumerable.Empty<StudentResponse>();
                }

                await _logService.LogAsync($"تم جلب الطلاب للصفحة {pageNumber} بحجم {pageSize} بنجاح", ExternalServicesEnums.LogType.Info);
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _exceptionService.GetExceptionMessage(ex));
            }
        }

        [HttpGet("{studentID}/terms", Name = "GetStudentTermsByStudentIDAsync")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<StudentTermResponse>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult<IEnumerable<StudentTermResponse>>> GetStudentTermsByStudentIDAsync(int studentID)
        {
            if (studentID <= 0)
            {
                return BadRequest("يجب أن يكون معرف الطالب أكبر من 0");
            }

            try
            {
                IEnumerable<StudentTermResponse>? responses = await _studentTermService.GetStudentTermsByStudentIDAsync(studentID);

                if (responses == null)
                {
                    responses = Enumerable.Empty<StudentTermResponse>();
                }

                await _logService.LogAsync($"تم جلب فصول الطالب بالمعرف {studentID} بنجاح", ExternalServicesEnums.LogType.Info);
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _exceptionService.GetExceptionMessage(ex));
            }
        }

        [HttpGet("{studentID}/courses", Name = "GetStudentCoursesByStudentIDAsync")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<StudentCourseResponse>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult<IEnumerable<StudentCourseResponse>>> GetStudentCoursesByStudentIDAsync(int studentID)
        {
            if (studentID <= 0)
            {
                return BadRequest("يجب أن يكون معرف الطالب أكبر من 0");
            }

            try
            {
                IEnumerable<StudentCourseResponse>? responses = await _studentCourseService.GetStudentCoursesByStudentIDAsync(studentID);

                if (responses == null)
                {
                    responses = Enumerable.Empty<StudentCourseResponse>();
                }

                await _logService.LogAsync($"تم جلب مقررات الطالب بالمعرف {studentID} بنجاح", ExternalServicesEnums.LogType.Info);
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _exceptionService.GetExceptionMessage(ex));
            }
        }


        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        [HttpPost("{studentID}/passed-courses", Name = "SyncStudentPassedCourses")]
        public async Task<ActionResult> SyncStudentPassedCourses(int studentID, SyncStudentPassedCoursesRequest request)
        {
            if (studentID <= 0 || request.PassedCourseIds.Count(cID => cID <= 0) > 0)
            {
                return BadRequest("يجب أن يكون معرف الطالب و معرفات الكورسات أكبر من 0");
            }

            try
            {
                bool res = await _studentCourseService.SyncStudentCoursesAsync(studentID , request.PassedCourseIds);

                if (res)
                {
                    await _logService.LogAsync("the courses was synced", ExternalServicesEnums.LogType.Info);
                    return NoContent();
                }

                await _logService.LogAsync($"an error ocuerd during syncing courses to student : {studentID}", ExternalServicesEnums.LogType.Warning);
                return BadRequest($"حصل خطأ");
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


        [ProducesResponseType(StatusCodes.Status200OK , Type = typeof(IEnumerable<CourseResponse>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        [HttpGet("{studentID}/open-courses", Name = "GetStudentOpenCourses")]
        public async Task<ActionResult<IEnumerable<CourseResponse>>> GetStudentOpenCourses(int studentID)
        {
            if (studentID <= 0)
            {
                return BadRequest("يجب أن يكون معرف الطالب أكبر من 0");
            }

            try
            {
                var res = await _studentCourseService.GetOpenCoursesByStudentIDAsync(studentID);

                if (res != null)
                {
                    await _logService.LogAsync($"open courses for student {studentID} were fetched", ExternalServicesEnums.LogType.Info);
                    return Ok(res);
                }

                await _logService.LogAsync($"an error ocuerd during get open courses to student : {studentID}", ExternalServicesEnums.LogType.Warning);
                return BadRequest($"حصل خطأ");
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

    }
}