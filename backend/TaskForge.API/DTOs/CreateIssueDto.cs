using TaskForge.API.Enums;

namespace TaskForge.API.DTOs;

public class CreateIssueDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IssueType Type { get; set; } = IssueType.Task;
    public IssuePriority Priority { get; set; } = IssuePriority.Medium;
    public int? AssigneeId { get; set; }
    public DateTime? DueDate { get; set; }
}