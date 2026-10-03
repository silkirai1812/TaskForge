using TaskForge.API.DTOs;

namespace TaskForge.API.Interfaces;

public interface IIssueService
{
    Task<IEnumerable<IssueDto>> GetByProjectAsync(int projectId);
    Task<IssueDto?> GetByIdAsync(int id);
    Task<IssueDto?> CreateAsync(int projectId, CreateIssueDto dto);
    Task<IssueDto?> UpdateAsync(int id, UpdateIssueDto dto);
    Task<bool> DeleteAsync(int id);

    Task<IEnumerable<CommentDto>> GetCommentsAsync(int issueId);
    Task<CommentDto?> AddCommentAsync(int issueId, CreateCommentDto dto);
    Task<CommentDto?> UpdateCommentAsync(int commentId, UpdateCommentDto dto);
    Task<bool> DeleteCommentAsync(int commentId);
}