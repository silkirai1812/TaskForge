using TaskForge.API.Enums;

namespace TaskForge.API.DTOs;

public class IssueDto
{
    public int Id { get; set; }

    public int ProjectId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public IssueType Type { get; set; }

    public IssuePriority Priority { get; set; }

    public IssueStatus Status { get; set; }

    public int ReporterId { get; set; }

    public string ReporterName { get; set; } = string.Empty;

    public int? AssigneeId { get; set; }

    public string? AssigneeName { get; set; }

    public DateTime? DueDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}