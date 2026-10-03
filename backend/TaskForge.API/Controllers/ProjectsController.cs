using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskForge.API.DTOs;
using TaskForge.API.Interfaces;

namespace TaskForge.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }


    // =====================================================
    // GET ALL PROJECTS
    // All authenticated roles
    // =====================================================

    [HttpGet]
    [Authorize(Roles = "Admin,ProjectManager,Developer")]
    public async Task<ActionResult<IEnumerable<ProjectDto>>> GetAll()
    {
        var projects =
            await _projectService.GetAllAsync();

        return Ok(projects);
    }


    // =====================================================
    // GET PROJECT BY ID
    // All authenticated roles
    // =====================================================

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,ProjectManager,Developer")]
    public async Task<ActionResult<ProjectDto>> GetById(int id)
    {
        var project =
            await _projectService.GetByIdAsync(id);

        if (project == null)
        {
            return NotFound();
        }

        return Ok(project);
    }


    // =====================================================
    // CREATE PROJECT
    // Admin + Project Manager
    // =====================================================

    [HttpPost]
    [Authorize(Roles = "Admin,ProjectManager")]
    public async Task<ActionResult<ProjectDto>> Create(
        CreateProjectDto dto)
    {
        var project =
            await _projectService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = project.Id },
            project);
    }


    // =====================================================
    // UPDATE PROJECT
    // Admin + Project Manager
    // =====================================================

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,ProjectManager")]
    public async Task<ActionResult<ProjectDto>> Update(
        int id,
        UpdateProjectDto dto)
    {
        var project =
            await _projectService.UpdateAsync(
                id,
                dto);

        if (project == null)
        {
            return NotFound();
        }

        return Ok(project);
    }


    // =====================================================
    // DELETE PROJECT
    // Admin ONLY
    // =====================================================

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted =
            await _projectService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}