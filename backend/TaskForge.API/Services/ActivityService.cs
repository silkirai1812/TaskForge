using Microsoft.EntityFrameworkCore;
using TaskForge.API.Data;
using TaskForge.API.DTOs;
using TaskForge.API.Interfaces;
using TaskForge.API.Models;

namespace TaskForge.API.Services;

public class ActivityService : IActivityService
{
    private readonly AppDbContext _context;

    public ActivityService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ActivityDto>> GetByIssueAsync(int issueId)
    {
        return await _context.Activities
            .AsNoTracking()
            .Where(a => a.IssueId == issueId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new ActivityDto
            {
                Id = a.Id,
                UserId = a.UserId,
                UserName = a.User.Name,
                ProjectId = a.ProjectId,
                IssueId = a.IssueId,
                Action = a.Action,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<ActivityDto>> GetByProjectAsync(int projectId)
    {
        return await _context.Activities
            .AsNoTracking()
            .Where(a => a.ProjectId == projectId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new ActivityDto
            {
                Id = a.Id,
                UserId = a.UserId,
                UserName = a.User.Name,
                ProjectId = a.ProjectId,
                IssueId = a.IssueId,
                Action = a.Action,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<ActivityDto> CreateAsync(
        int userId,
        int? projectId,
        int? issueId,
        string action)
    {
        var activity = new Activity
        {
            UserId = userId,
            ProjectId = projectId,
            IssueId = issueId,
            Action = action
        };

        _context.Activities.Add(activity);

        await _context.SaveChangesAsync();

        return await _context.Activities
            .AsNoTracking()
            .Where(a => a.Id == activity.Id)
            .Select(a => new ActivityDto
            {
                Id = a.Id,
                UserId = a.UserId,
                UserName = a.User.Name,
                ProjectId = a.ProjectId,
                IssueId = a.IssueId,
                Action = a.Action,
                CreatedAt = a.CreatedAt
            })
            .FirstAsync();
    }
}