using TaskForge.API.DTOs;

namespace TaskForge.API.Interfaces;

public interface IActivityService
{
    Task<IEnumerable<ActivityDto>> GetByIssueAsync(int issueId);
    Task<IEnumerable<ActivityDto>> GetByProjectAsync(int projectId);
    Task<ActivityDto> CreateAsync(
        int userId,
        int? projectId,
        int? issueId,
        string action);
}