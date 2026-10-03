using Microsoft.EntityFrameworkCore;
using TaskForge.API.Data;
using TaskForge.API.DTOs;
using TaskForge.API.Interfaces;
using TaskForge.API.Models;

namespace TaskForge.API.Services;

public class ProjectService : IProjectService
{
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ProjectService(
        AppDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    // ==========================================
    // GET ALL PROJECTS
    // ==========================================

    public async Task<IEnumerable<ProjectDto>> GetAllAsync()
    {
        return await _context.Projects
            .AsNoTracking()
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Status = p.Status,
                StartDate = p.StartDate,
                EndDate = p.EndDate
            })
            .ToListAsync();
    }


    // ==========================================
    // GET PROJECT BY ID
    // ==========================================

    public async Task<ProjectDto?> GetByIdAsync(int id)
    {
        return await _context.Projects
            .AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Status = p.Status,
                StartDate = p.StartDate,
                EndDate = p.EndDate
            })
            .FirstOrDefaultAsync();
    }


    // ==========================================
    // CREATE PROJECT
    // ==========================================

    public async Task<ProjectDto> CreateAsync(
        CreateProjectDto dto)
    {
        var currentUserId = _currentUser.UserId;

        if (!currentUserId.HasValue)
        {
            throw new UnauthorizedAccessException(
                "Authenticated user was not found.");
        }

        var userExists = await _context.Users
            .AnyAsync(u =>
                u.Id == currentUserId.Value &&
                u.IsActive);

        if (!userExists)
        {
            throw new UnauthorizedAccessException(
                "Authenticated user is invalid or inactive.");
        }

        var project = new Project
        {
            Name = dto.Name.Trim(),
            Description = dto.Description.Trim(),
            Status = string.IsNullOrWhiteSpace(dto.Status)
                ? "Active"
                : dto.Status.Trim(),
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,

            // IMPORTANT:
            // Creator comes from JWT, not Angular request
            CreatedById = currentUserId.Value
        };

        _context.Projects.Add(project);

        await _context.SaveChangesAsync();

        return new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            Status = project.Status,
            StartDate = project.StartDate,
            EndDate = project.EndDate
        };
    }


    // ==========================================
    // UPDATE PROJECT
    // ==========================================

    public async Task<ProjectDto?> UpdateAsync(
        int id,
        UpdateProjectDto dto)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return null;
        }

        project.Name = dto.Name.Trim();
        project.Description = dto.Description.Trim();
        project.Status = dto.Status.Trim();
        project.StartDate = dto.StartDate;
        project.EndDate = dto.EndDate;
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            Status = project.Status,
            StartDate = project.StartDate,
            EndDate = project.EndDate
        };
    }


    // ==========================================
    // DELETE PROJECT
    // ==========================================

    public async Task<bool> DeleteAsync(int id)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return false;
        }

        _context.Projects.Remove(project);

        await _context.SaveChangesAsync();

        return true;
    }


    // ==========================================
    // GET PROJECT MEMBERS
    // ==========================================

    public async Task<IEnumerable<ProjectMemberDto>> GetMembersAsync(
        int projectId)
    {
        return await _context.ProjectMembers
            .AsNoTracking()
            .Where(pm => pm.ProjectId == projectId)
            .Select(pm => new ProjectMemberDto
            {
                UserId = pm.UserId,
                Name = pm.User.Name,
                Email = pm.User.Email,
                Role = pm.User.Role.Name,
                JoinedAt = pm.JoinedAt
            })
            .ToListAsync();
    }


    // ==========================================
    // ADD MEMBER
    // ==========================================

    public async Task<bool> AddMemberAsync(
        int projectId,
        int userId)
    {
        var projectExists = await _context.Projects
            .AnyAsync(p => p.Id == projectId);

        if (!projectExists)
        {
            return false;
        }

        var userExists = await _context.Users
            .AnyAsync(u =>
                u.Id == userId &&
                u.IsActive);

        if (!userExists)
        {
            return false;
        }

        var alreadyMember = await _context.ProjectMembers
            .AnyAsync(pm =>
                pm.ProjectId == projectId &&
                pm.UserId == userId);

        if (alreadyMember)
        {
            return false;
        }

        var member = new ProjectMember
        {
            ProjectId = projectId,
            UserId = userId
        };

        _context.ProjectMembers.Add(member);

        await _context.SaveChangesAsync();

        return true;
    }


    // ==========================================
    // REMOVE MEMBER
    // ==========================================

    public async Task<bool> RemoveMemberAsync(
        int projectId,
        int userId)
    {
        var member = await _context.ProjectMembers
            .FirstOrDefaultAsync(pm =>
                pm.ProjectId == projectId &&
                pm.UserId == userId);

        if (member == null)
        {
            return false;
        }

        _context.ProjectMembers.Remove(member);

        await _context.SaveChangesAsync();

        return true;
    }
}