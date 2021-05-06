using ContosoUniversitySPA.Data;
using ContosoUniversitySPA.Models;
using ContosoUniversitySPA.Models.SchoolViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.Graph;
using Microsoft.Identity.Client;
using Microsoft.Identity.Web;
using Microsoft.Identity.Web.Resource;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ContosoUniversitySPA.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TokensController : ControllerBase
    {
        private readonly ILogger<TokensController> _logger;
        private readonly GraphServiceClient _graphServiceClient;
        private readonly IOptions<MicrosoftGraphOptions> _graphOptions;
        private readonly ITokenAcquisition _tokenAcquisition;

        static readonly string[] scopeRequiredByApi = new string[] { "access_as_user" };

        public TokensController(ILogger<TokensController> logger, GraphServiceClient graphServiceClient, IOptions<MicrosoftGraphOptions> graphOptions, ITokenAcquisition tokenAcquisition)
        {
            _logger = logger;
            _graphServiceClient = graphServiceClient;
            _graphOptions = graphOptions;
            _tokenAcquisition = tokenAcquisition;
        }

        [HttpGet]
        [Route("checkconsent")]
        public async Task<ActionResult> GetAsync()
        {
            HttpContext.VerifyUserHasAnyAcceptedScope(scopeRequiredByApi);
            var scopes = _graphOptions.Value.Scopes?.Split(' ');
            try
            {
                await _tokenAcquisition.GetAccessTokenForUserAsync(scopes);
                return Ok();
            }
            catch (Exception e) when ((e.InnerException as MsalUiRequiredException) != null)
            {
                var ex = e.InnerException as MsalUiRequiredException; 
                return StatusCode(StatusCodes.Status403Forbidden, new
                {
                    errorCode = ex.ErrorCode,
                    errorMessage = ex.Message
                });
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new
                {
                    errorCode = e.HResult.ToString(),
                    errorMessage = e.Message
                });
            }
        }
    }
}
