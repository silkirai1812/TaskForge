using TaskForge.API.DTOs;

namespace TaskForge.API.Interfaces;

public interface IAiIssueService
{
    Task<AiIssueResponseDto> AnalyzeIssueAsync(AiIssueRequestDto request);
}