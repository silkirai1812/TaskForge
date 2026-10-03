using Microsoft.EntityFrameworkCore;
using TaskForge.API.Data;
using TaskForge.API.DTOs;
using TaskForge.API.Enums;
using TaskForge.API.Interfaces;
using TaskForge.API.Models;

namespace TaskForge.API.Services;

public class IssueService : IIssueService
{
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IActivityService _activityService;

    public IssueService(
        AppDbContext context,
        ICurrentUserService currentUser,
        IActivityService activityService)
    {
        _context = context;
        _currentUser = currentUser;
        _activityService = activityService;
    }

    // =========================
    // ISSUES
    // =========================

    public async Task<IEnumerable<IssueDto>> GetByProjectAsync(int projectId)
    {
        return await _context.Issues
            .AsNoTracking()
            .Where(i => i.ProjectId == projectId)
            .Select(i => new IssueDto
            {
                Id = i.Id,
                ProjectId = i.ProjectId,
                Title = i.Title,
                Description = i.Description,
                Type = i.Type,
                Priority = i.Priority,
                Status = i.Status,
                ReporterId = i.ReporterId,
                ReporterName = i.Reporter.Name,
                AssigneeId = i.AssigneeId,
                AssigneeName = i.Assignee != null
                    ? i.Assignee.Name
                    : null,
                DueDate = i.DueDate,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<IssueDto?> GetByIdAsync(int id)
    {
        return await _context.Issues
            .AsNoTracking()
            .Where(i => i.Id == id)
            .Select(i => new IssueDto
            {
                Id = i.Id,
                ProjectId = i.ProjectId,
                Title = i.Title,
                Description = i.Description,
                Type = i.Type,
                Priority = i.Priority,
                Status = i.Status,
                ReporterId = i.ReporterId,
                ReporterName = i.Reporter.Name,
                AssigneeId = i.AssigneeId,
                AssigneeName = i.Assignee != null
                    ? i.Assignee.Name
                    : null,
                DueDate = i.DueDate,
                CreatedAt = i.CreatedAt,
                UpdatedAt = i.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<IssueDto?> CreateAsync(
        int projectId,
        CreateIssueDto dto)
    {
        var projectExists = await _context.Projects
            .AnyAsync(p => p.Id == projectId);

        if (!projectExists)
        {
            return null;
        }

        var currentUserId = _currentUser.UserId;

        if (!currentUserId.HasValue)
        {
            return null;
        }

        var reporterExists = await _context.Users
            .AnyAsync(u =>
                u.Id == currentUserId.Value &&
                u.IsActive);

        if (!reporterExists)
        {
            return null;
        }

        if (dto.AssigneeId.HasValue)
        {
            var assigneeExists = await _context.Users
                .AnyAsync(u =>
                    u.Id == dto.AssigneeId.Value &&
                    u.IsActive);

            if (!assigneeExists)
            {
                return null;
            }
        }

        var issue = new Issue
        {
            ProjectId = projectId,
            Title = dto.Title,
            Description = dto.Description,
            Type = dto.Type,
            Priority = dto.Priority,
            Status = IssueStatus.Todo,
            ReporterId = currentUserId.Value,
            AssigneeId = dto.AssigneeId,
            DueDate = dto.DueDate
        };

        _context.Issues.Add(issue);

        await _context.SaveChangesAsync();

        // Automatically record issue creation.
        await _activityService.CreateAsync(
            currentUserId.Value,
            projectId,
            issue.Id,
            $"Created issue '{issue.Title}'");

        return await GetByIdAsync(issue.Id);
    }

    public async Task<IssueDto?> UpdateAsync(
        int id,
        UpdateIssueDto dto)
    {
        var issue = await _context.Issues
            .FirstOrDefaultAsync(i => i.Id == id);

        if (issue == null)
        {
            return null;
        }

        if (dto.AssigneeId.HasValue)
        {
            var assigneeExists = await _context.Users
                .AnyAsync(u =>
                    u.Id == dto.AssigneeId.Value &&
                    u.IsActive);

            if (!assigneeExists)
            {
                return null;
            }
        }

        issue.Title = dto.Title;
        issue.Description = dto.Description;
        issue.Type = dto.Type;
        issue.Priority = dto.Priority;
        issue.Status = dto.Status;
        issue.AssigneeId = dto.AssigneeId;
        issue.DueDate = dto.DueDate;
        issue.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(issue.Id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var issue = await _context.Issues
            .FirstOrDefaultAsync(i => i.Id == id);

        if (issue == null)
        {
            return false;
        }

        _context.Issues.Remove(issue);

        await _context.SaveChangesAsync();

        return true;
    }

    // =========================
    // COMMENTS
    // =========================

    public async Task<IEnumerable<CommentDto>> GetCommentsAsync(int issueId)
    {
        return await _context.Comments
            .AsNoTracking()
            .Where(c => c.IssueId == issueId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CommentDto
            {
                Id = c.Id,
                IssueId = c.IssueId,
                UserId = c.UserId,
                UserName = c.User.Name,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<CommentDto?> AddCommentAsync(
        int issueId,
        CreateCommentDto dto)
    {
        var issue = await _context.Issues
            .FirstOrDefaultAsync(i => i.Id == issueId);

        if (issue == null)
        {
            return null;
        }

        var currentUserId = _currentUser.UserId;

        if (!currentUserId.HasValue)
        {
            return null;
        }

        var userExists = await _context.Users
            .AnyAsync(u =>
                u.Id == currentUserId.Value &&
                u.IsActive);

        if (!userExists)
        {
            return null;
        }

        var comment = new Comment
        {
            IssueId = issueId,
            UserId = currentUserId.Value,
            Content = dto.Content
        };

        _context.Comments.Add(comment);

        await _context.SaveChangesAsync();

        // Automatically record comment creation.
        await _activityService.CreateAsync(
            currentUserId.Value,
            issue.ProjectId,
            issueId,
            $"Added comment to issue '{issue.Title}'");

        return await _context.Comments
            .AsNoTracking()
            .Where(c => c.Id == comment.Id)
            .Select(c => new CommentDto
            {
                Id = c.Id,
                IssueId = c.IssueId,
                UserId = c.UserId,
                UserName = c.User.Name,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<CommentDto?> UpdateCommentAsync(
        int commentId,
        UpdateCommentDto dto)
    {
        var comment = await _context.Comments
            .FirstOrDefaultAsync(c => c.Id == commentId);

        if (comment == null)
        {
            return null;
        }

        var currentUserId = _currentUser.UserId;

        if (!currentUserId.HasValue)
        {
            return null;
        }

        // Users can only edit their own comments.
        if (comment.UserId != currentUserId.Value)
        {
            return null;
        }

        comment.Content = dto.Content;
        comment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Automatically record comment update.
        await _activityService.CreateAsync(
            currentUserId.Value,
            null,
            comment.IssueId,
            $"Updated comment on issue {comment.IssueId}");

        return await _context.Comments
            .AsNoTracking()
            .Where(c => c.Id == comment.Id)
            .Select(c => new CommentDto
            {
                Id = c.Id,
                IssueId = c.IssueId,
                UserId = c.UserId,
                UserName = c.User.Name,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<bool> DeleteCommentAsync(int commentId)
    {
        var comment = await _context.Comments
            .FirstOrDefaultAsync(c => c.Id == commentId);

        if (comment == null)
        {
            return false;
        }

        var currentUserId = _currentUser.UserId;

        if (!currentUserId.HasValue)
        {
            return false;
        }

        // Users can only delete their own comments.
        if (comment.UserId != currentUserId.Value)
        {
            return false;
        }

        // Record activity before deleting the comment.
        await _activityService.CreateAsync(
            currentUserId.Value,
            null,
            comment.IssueId,
            $"Deleted comment from issue {comment.IssueId}");
        _context.Comments.Remove(comment);

        await _context.SaveChangesAsync();

        return true;
    }
}