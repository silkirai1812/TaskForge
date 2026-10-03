using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskForge.API.DTOs;
using TaskForge.API.Interfaces;

namespace TaskForge.API.Controllers;

[ApiController]
[Authorize]
[Route("api/projects/{projectId}/members")]
public class ProjectMembersController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectMembersController(
        IProjectService projectService)
    {
        _projectService = projectService;
    }


    // =====================================================
    // GET PROJECT MEMBERS
    // All authenticated roles
    // =====================================================

    [HttpGet]
    [Authorize(Roles = "Admin,ProjectManager,Developer")]
    public async Task<ActionResult<IEnumerable<ProjectMemberDto>>> GetMembers(
        int projectId)
    {
        var members =
            await _projectService.GetMembersAsync(
                projectId);

        return Ok(members);
    }


    // =====================================================
    // ADD MEMBER
    // Admin + Project Manager
    // =====================================================

    [HttpPost("{userId}")]
    [Authorize(Roles = "Admin,ProjectManager")]
    public async Task<IActionResult> AddMember(
        int projectId,
        int userId)
    {
        var added =
            await _projectService.AddMemberAsync(
                projectId,
                userId);

        if (!added)
        {
            return BadRequest(
                "Project or user does not exist, or user is already a member.");
        }

        return StatusCode(201);
    }


    // =====================================================
    // REMOVE MEMBER
    // Admin + Project Manager
    // =====================================================

    [HttpDelete("{userId}")]
    [Authorize(Roles = "Admin,ProjectManager")]
    public async Task<IActionResult> RemoveMember(
        int projectId,
        int userId)
    {
        var removed =
            await _projectService.RemoveMemberAsync(
                projectId,
                userId);

        if (!removed)
        {
            return NotFound();
        }

        return NoContent();
    }
}