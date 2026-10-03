namespace TaskForge.API.DTOs;

public class CommentDto
{
    public int Id { get; set; }
    public int IssueId { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}