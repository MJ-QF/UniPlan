using Business.DTOs.Requests;
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
    [Route("api/wishLists")]
    [ApiController]
    public class WishListsController : ControllerBase
    {
        private readonly IGeneratedScheduleService _scheduleService;
        private readonly IWishListService _listService;
        private readonly ILogService _logService;
        private readonly IExceptionService _exceptionService;
        private readonly IWishListItemService _wishListItemService;

        public WishListsController(ILogService logService, IExceptionService exceptionService, IWishListItemService wishListItemService, IGeneratedScheduleService scheduleService, IWishListService listService)
        {
            _listService = listService;
            _logService = logService;
            _exceptionService = exceptionService;
            _wishListItemService = wishListItemService;
            _scheduleService = scheduleService;
        }

        [HttpPost(Name = "AddWishListAsync")]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(WishListResponse))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status422UnprocessableEntity, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult<WishListResponse?>> AddWishListAsync(WishListRequest request)
        {
            try
            {
                WishListResponse? response = await _listService.AddWishListAsync(request);

                if (response != null)
                {
                    await _logService.LogAsync("تم إضافة قائمة الرغبات بنجاح", ExternalServicesEnums.LogType.Info);
                    return CreatedAtRoute("GetWishListByIDAsync", new { listID = response.WishListID }, response);
                }

                await _logService.LogAsync("فشل إضافة قائمة الرغبات بسبب خطأ في الخادم", ExternalServicesEnums.LogType.Warning);
                return StatusCode(StatusCodes.Status500InternalServerError, "فشل إضافة قائمة الرغبات");
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

        [HttpDelete("{listID}", Name = "DeleteWishListAsync")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult> DeleteWishListAsync(int listID)
        {
            try
            {
                bool res = await _listService.DeleteWishListAsync(listID);

                if (res)
                {
                    await _logService.LogAsync("تم حذف قائمة الرغبات بنجاح", ExternalServicesEnums.LogType.Info);
                    return NoContent();
                }

                await _logService.LogAsync($"لم يتم العثور على قائمة الرغبات بالمعرف {listID}", ExternalServicesEnums.LogType.Warning);
                return NotFound($"لم يتم العثور على قائمة الرغبات بالمعرف {listID}");
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

        [HttpGet("{listID}", Name = "GetWishListByIDAsync")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(WishListResponse))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult<WishListResponse>> GetWishListByIDAsync(int listID)
        {
            try
            {
                WishListResponse? response = await _listService.GetWishListByIDAsync(listID);

                if (response != null)
                {
                    await _logService.LogAsync($"تم جلب قائمة الرغبات بالمعرف {listID} بنجاح", ExternalServicesEnums.LogType.Info);
                    return Ok(response);
                }

                await _logService.LogAsync($"لم يتم العثور على قائمة الرغبات بالمعرف {listID}", ExternalServicesEnums.LogType.Warning);
                return NotFound($"لم يتم العثور على قائمة الرغبات بالمعرف {listID}");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _exceptionService.GetExceptionMessage(ex));
            }
        }

        [HttpGet("{wishListID}/items", Name = "GetWishListItemsByWishListIDAsync")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<WishListItemResponse>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult<IEnumerable<WishListItemResponse>>> GetWishListItemsByWishListIDAsync(int wishListID)
        {
            if (wishListID <= 0)
            {
                return BadRequest("يجب أن يكون معرف قائمة الرغبات أكبر من 0");
            }

            try
            {
                IEnumerable<WishListItemResponse>? responses = await _wishListItemService.GetWishListItemsByStudentIDAsync(wishListID);

                if (responses == null)
                {
                    responses = Enumerable.Empty<WishListItemResponse>();
                }

                await _logService.LogAsync($"تم جلب عناصر قائمة الرغبات بالمعرف {wishListID} بنجاح", ExternalServicesEnums.LogType.Info);
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _exceptionService.GetExceptionMessage(ex));
            }
        }

        [HttpGet("{listID}/generatedSchedule", Name = "GetGeneratedScheduleByWishListIDAsync")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(GeneratedScheduleResponse))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult<GeneratedScheduleResponse>> GetGeneratedScheduleByWishListIDAsync(int listID)
        {
            if (listID <= 0)
            {
                return BadRequest("يجب أن يكون معرف قائمة الرغبات أكبر من 0");
            }

            try
            {
                GeneratedScheduleResponse? response = await _scheduleService.GetGeneratedScheduleByWishListIDAsync(listID);

                if (response != null)
                {
                    await _logService.LogAsync($"تم جلب الجدول المُولّد لقائمة الرغبات بالمعرف {listID} بنجاح", ExternalServicesEnums.LogType.Info);
                    return Ok(response);
                }

                await _logService.LogAsync($"لم يتم العثور على جدول مُولّد لقائمة الرغبات بالمعرف {listID}", ExternalServicesEnums.LogType.Warning);
                return NotFound($"لم يتم العثور على جدول مُولّد لقائمة الرغبات بالمعرف {listID}");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _exceptionService.GetExceptionMessage(ex));
            }
        }

        [HttpGet("{listID}/{scheduleNum}/scheduleDetail", Name = "GetScheduleDetailByWishListIDAsync")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ScheduleDetailResponse))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult<ScheduleDetailResponse>> GetScheduleDetailByWishListIDAsync(int listID, int scheduleNum)
        {
            if (listID <= 0 && scheduleNum <= 0)
            {
                return BadRequest("يجب أن يكون معرف قائمة الرغبات و رقم الجدول أكبر من 0");
            }

            try
            {
                ScheduleDetailResponse? response = await _scheduleService.GetScheduleDetailByWishListIDAsync(listID, scheduleNum);

                if (response != null)
                {
                    await _logService.LogAsync($"تم جلب الجدول المُولّد لقائمة الرغبات بالمعرف و رقم الجدول {scheduleNum}{listID} بنجاح", ExternalServicesEnums.LogType.Info);
                    return Ok(response);
                }

                await _logService.LogAsync($"لم يتم العثور على جدول مُولّد لقائمة الرغبات بالمعرف {listID} و رقم الجدول {scheduleNum}", ExternalServicesEnums.LogType.Warning);
                return NotFound($"لم يتم العثور على جدول مُولّد لقائمة الرغبات بالمعرف {listID} و رقم الجدول {scheduleNum}");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _exceptionService.GetExceptionMessage(ex));
            }
        }

        [HttpPut("{listID}/syncCourses", Name = "SyncCoursesAsync")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult<bool>> SyncCoursesAsync(int listID, [FromBody] SyncCoursesRequest request)
        {
            if (listID <= 0)
            {
                return BadRequest("يجب أن يكون معرف قائمة الرغبات أكبر من 0");
            }

            try
            {
                bool result = await _listService.SyncCoursesAsync(listID, request);

                if (result)
                {
                    await _logService.LogAsync($"تم مزامنة كورسات قائمة الرغبات بالمعرف {listID} بنجاح", ExternalServicesEnums.LogType.Info);
                    return Ok(true);
                }

                await _logService.LogAsync($"فشلت مزامنة الكورسات لقائمة الرغبات بالمعرف {listID}", ExternalServicesEnums.LogType.Warning);
                return StatusCode(StatusCodes.Status500InternalServerError, "فشلت عملية المزامنة");
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