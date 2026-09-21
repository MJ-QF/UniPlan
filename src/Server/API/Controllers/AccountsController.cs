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
    [Route("api/accounts")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly ILogService _logService;
        private readonly IExceptionService _exceptionService;

        public AccountsController(IAccountService accountService, ILogService logService, IExceptionService exceptionService)
        {
            _accountService = accountService;
            _logService = logService;
            _exceptionService = exceptionService;
        }

        [HttpGet("{accountID}", Name = "GetAccountByIDAsync")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AccountResponse))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(string))]
        public async Task<ActionResult<AccountResponse>> GetAccountByIDAsync(int accountID)
        {
            try
            {
                AccountResponse? response = await _accountService.GetAccountByIDAsync(accountID);

                if (response != null)
                {
                    await _logService.LogAsync($"تم جلب الحساب بالمعرف {accountID} بنجاح", ExternalServicesEnums.LogType.Info);
                    return Ok(response);
                }

                await _logService.LogAsync($"لم يتم العثور على الحساب بالمعرف {accountID}", ExternalServicesEnums.LogType.Warning);
                return NotFound($"لم يتم العثور على الحساب بالمعرف {accountID}");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, _exceptionService.GetExceptionMessage(ex));
            }
        }
    }
}