using Business.DTOs.Requests;
using Business.DTOs.Requests.Update;
using Business.DTOs.Responses;
using Business.Interfaces;
using Core.Enums;
using Core.Exceptions;
using Core.Interfaces.ExternalServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace API.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly ILogService _logService;
        private readonly IExceptionService _exceptionService;

        public AuthController(IAccountService accountService, ILogService logService, IExceptionService exceptionService)
        {
            _accountService = accountService;
            _logService = logService;
            _exceptionService = exceptionService;
        }

        [HttpPost("login", Name = "LoginAsync")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AccountResponse))]
        [ProducesResponseType(StatusCodes.Status422UnprocessableEntity, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult<AccountResponse?>> LoginAsync(LoginRequest request)
        {
            try
            {
                AccountResponse? response = await _accountService.LoginAsync(request);

                if (response != null)
                {
                    await _logService.LogAsync("تم تسجيل دخول الحساب بنجاح", ExternalServicesEnums.LogType.Info);
                    return Ok(response);
                }

                await _logService.LogAsync("فشل تسجيل دخول الحساب", ExternalServicesEnums.LogType.Warning);
                return Unauthorized("فشل تسجيل دخول الحساب");
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

        [HttpPut("{accountID}/updatePassword", Name = "UpdatePasswordAsync")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status422UnprocessableEntity, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status409Conflict, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult<bool>> UpdatePasswordAsync(ChangePasswordRequest request, int accountID)
        {
            try
            {
                bool res = await _accountService.UpdatePasswordAsync(request, accountID);

                if (res)
                {
                    await _logService.LogAsync("تم تحديث كلمة المرور بنجاح", ExternalServicesEnums.LogType.Info);
                    return NoContent();
                }

                await _logService.LogAsync("فشل تعديل كلمة السر للحساب", ExternalServicesEnums.LogType.Warning);
                return Unauthorized("فشل تعديل كلمة السر للحساب");
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
    }
}
