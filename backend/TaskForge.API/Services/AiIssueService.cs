using System.Text.Json;
using Google.GenAI;
using TaskForge.API.DTOs;
using TaskForge.API.Interfaces;

namespace TaskForge.API.Services;

public class AiIssueService : IAiIssueService
{
    private readonly IConfiguration _configuration;

    public AiIssueService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<AiIssueResponseDto> AnalyzeIssueAsync(
        AiIssueRequestDto request)
    {
        var apiKey = _configuration["Gemini:ApiKey"];
        var model = _configuration["Gemini:Model"] ?? "gemini-flash-latest";

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException(
                "Gemini API key is not configured.");
        }

        var client = new Client(apiKey: apiKey);

        var prompt = $"""
        You are an AI assistant inside a project management application called TaskForge.

        Analyze the following software issue.

        Issue title:
        {request.Title}

        Issue description:
        {request.Description}

        Return ONLY valid JSON.

        The JSON must contain exactly these fields:
        improvedTitle
        improvedDescription
        suggestedType
        suggestedPriority
        acceptanceCriteria
        implementationSuggestions

        Rules:
        - suggestedType must be one of: Task, Bug, Story, Feature
        - suggestedPriority must be one of: Low, Medium, High, Critical
        - acceptanceCriteria must be an array of clear testable statements
        - implementationSuggestions must be an array of practical development suggestions
        - Keep the suggestions relevant to the provided issue
        - Do not invent unrelated requirements
        """;

        var response = await client.Models.GenerateContentAsync(
            model: model,
            contents: prompt
        );

        var generatedText =
            response.Candidates?
                .FirstOrDefault()?
                .Content?
                .Parts?
                .FirstOrDefault()?
                .Text;

        if (string.IsNullOrWhiteSpace(generatedText))
        {
            throw new InvalidOperationException(
                "Gemini returned an empty response.");
        }

        generatedText = CleanJsonResponse(generatedText);

        var result = JsonSerializer.Deserialize<AiIssueResponseDto>(
            generatedText,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        if (result == null)
        {
            throw new InvalidOperationException(
                "Could not parse the AI response.");
        }

        return result;
    }

    private static string CleanJsonResponse(string text)
    {
        text = text.Trim();

        if (text.StartsWith("```json"))
        {
            text = text.Substring(7);
        }
        else if (text.StartsWith("```"))
        {
            text = text.Substring(3);
        }

        if (text.EndsWith("```"))
        {
            text = text.Substring(0, text.Length - 3);
        }

        return text.Trim();
    }
}