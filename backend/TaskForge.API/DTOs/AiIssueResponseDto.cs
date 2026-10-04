namespace TaskForge.API.DTOs;

public class AiIssueResponseDto
{
    public string ImprovedTitle { get; set; } = string.Empty;
    public string ImprovedDescription { get; set; } = string.Empty;
    public string SuggestedType { get; set; } = string.Empty;
    public string SuggestedPriority { get; set; } = string.Empty;
    public List<string> AcceptanceCriteria { get; set; } = new();
    public List<string> ImplementationSuggestions { get; set; } = new();
}