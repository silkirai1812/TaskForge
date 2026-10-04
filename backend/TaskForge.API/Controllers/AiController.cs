using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskForge.API.DTOs;
using TaskForge.API.Interfaces;

namespace TaskForge.API.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
public class AiController : ControllerBase
{
    private readonly IAiIssueService _aiIssueService;

    public AiController(IAiIssueService aiIssueService)
    {
        _aiIssueService = aiIssueService;
    }

    [HttpPost("analyze-issue")]
    public async Task<ActionResult<AiIssueResponseDto>> AnalyzeIssue(
        [FromBody] AiIssueRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest("Issue title is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Description))
        {
            return BadRequest("Issue description is required.");
        }

        try
        {
            var result = await _aiIssueService.AnalyzeIssueAsync(request);

            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine("========== GEMINI AI ERROR ==========");
            Console.WriteLine(ex.ToString());
            Console.WriteLine("=====================================");

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "AI analysis failed.",
                    details = ex.Message
                });
        }
    }
}