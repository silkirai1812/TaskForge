using TaskForge.API.Enums;

namespace TaskForge.API.DTOs;

public class UpdateIssueDto
{
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public IssueType Type { get; set; }

    public IssuePriority Priority { get; set; }

    public IssueStatus Status { get; set; }

    public int? AssigneeId { get; set; }

    public DateTime? DueDate { get; set; }
}