namespace TaskForge.API.Models;

public class Activity
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int? ProjectId { get; set; }

    public int? IssueId { get; set; }

    public string Action { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;

    public Project? Project { get; set; }

    public Issue? Issue { get; set; }
}