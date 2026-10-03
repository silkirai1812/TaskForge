using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskForge.API.DTOs;
using TaskForge.API.Interfaces;

namespace TaskForge.API.Controllers;

[ApiController]
[Authorize]
public class IssuesController : ControllerBase
{
    private readonly IIssueService _issueService;

    public IssuesController(IIssueService issueService)
    {
        _issueService = issueService;
    }


    // =====================================================
    // GET ISSUES BY PROJECT
    // =====================================================

    [HttpGet("api/projects/{projectId}/issues")]
    public async Task<ActionResult<IEnumerable<IssueDto>>> GetByProject(
        int projectId)
    {
        var issues =
            await _issueService.GetByProjectAsync(projectId);

        return Ok(issues);
    }


    // =====================================================
    // GET ISSUE BY ID
    // =====================================================

    [HttpGet("api/issues/{id}")]
    public async Task<ActionResult<IssueDto>> GetById(int id)
    {
        var issue =
            await _issueService.GetByIdAsync(id);

        if (issue == null)
        {
            return NotFound();
        }

        return Ok(issue);
    }


    // =====================================================
    // CREATE ISSUE
    // Admin + Project Manager + Developer
    // =====================================================

    [HttpPost("api/projects/{projectId}/issues")]
    [Authorize(
        Roles = "Admin,ProjectManager,Developer"
    )]
    public async Task<ActionResult<IssueDto>> Create(
        int projectId,
        CreateIssueDto dto)
    {
        var issue =
            await _issueService.CreateAsync(
                projectId,
                dto);

        if (issue == null)
        {
            return BadRequest(
                "Project, authenticated user, or assignee is invalid.");
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = issue.Id },
            issue);
    }


    // =====================================================
    // UPDATE ISSUE
    // Admin + Project Manager + Developer
    // =====================================================

    [HttpPut("api/issues/{id}")]
    [Authorize(
        Roles = "Admin,ProjectManager,Developer"
    )]
    public async Task<ActionResult<IssueDto>> Update(
        int id,
        UpdateIssueDto dto)
    {
        var issue =
            await _issueService.UpdateAsync(
                id,
                dto);

        if (issue == null)
        {
            return NotFound();
        }

        return Ok(issue);
    }


    // =====================================================
    // DELETE ISSUE
    // Admin ONLY
    // =====================================================

    [HttpDelete("api/issues/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted =
            await _issueService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}