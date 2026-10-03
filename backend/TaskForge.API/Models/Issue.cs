namespace TaskForge.API.Models;
using TaskForge.API.Enums;

public class Issue
{
    public int Id { get; set; }

    public int ProjectId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public IssueType Type { get; set; } = IssueType.Task;

    public IssuePriority Priority { get; set; } = IssuePriority.Medium;

    public IssueStatus Status { get; set; } = IssueStatus.Todo;

    public int ReporterId { get; set; }

    public int? AssigneeId { get; set; }

    public DateTime? DueDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Project Project { get; set; } = null!;

    public User Reporter { get; set; } = null!;

    public User? Assignee { get; set; }

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}