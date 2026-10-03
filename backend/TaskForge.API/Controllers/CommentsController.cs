using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskForge.API.DTOs;
using TaskForge.API.Interfaces;

namespace TaskForge.API.Controllers;

[ApiController]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly IIssueService _issueService;

    public CommentsController(IIssueService issueService)
    {
        _issueService = issueService;
    }


    // =====================================================
    // GET COMMENTS
    // Admin + Project Manager + Developer
    // =====================================================

    [HttpGet("api/issues/{issueId}/comments")]
    [Authorize(
        Roles = "Admin,ProjectManager,Developer"
    )]
    public async Task<ActionResult<IEnumerable<CommentDto>>> GetComments(
        int issueId)
    {
        var comments =
            await _issueService.GetCommentsAsync(issueId);

        return Ok(comments);
    }


    // =====================================================
    // ADD COMMENT
    // Admin + Project Manager + Developer
    // =====================================================

    [HttpPost("api/issues/{issueId}/comments")]
    [Authorize(
        Roles = "Admin,ProjectManager,Developer"
    )]
    public async Task<ActionResult<CommentDto>> AddComment(
        int issueId,
        CreateCommentDto dto)
    {
        var comment =
            await _issueService.AddCommentAsync(
                issueId,
                dto);

        if (comment == null)
        {
            return BadRequest(
                "Issue or authenticated user does not exist.");
        }

        return CreatedAtAction(
            nameof(GetComments),
            new { issueId },
            comment);
    }


    // =====================================================
    // UPDATE COMMENT
    // Admin + Project Manager + Developer
    // Ownership is enforced by IssueService.
    // =====================================================

    [HttpPut("api/comments/{id}")]
    [Authorize(
        Roles = "Admin,ProjectManager,Developer"
    )]
    public async Task<ActionResult<CommentDto>> UpdateComment(
        int id,
        UpdateCommentDto dto)
    {
        var comment =
            await _issueService.UpdateCommentAsync(
                id,
                dto);

        if (comment == null)
        {
            return NotFound(
                "Comment was not found or you do not have permission to edit it.");
        }

        return Ok(comment);
    }


    // =====================================================
    // DELETE COMMENT
    // Admin + Project Manager + Developer
    // Ownership is enforced by IssueService.
    // =====================================================

    [HttpDelete("api/comments/{id}")]
    [Authorize(
        Roles = "Admin,ProjectManager,Developer"
    )]
    public async Task<IActionResult> DeleteComment(int id)
    {
        var deleted =
            await _issueService.DeleteCommentAsync(id);

        if (!deleted)
        {
            return NotFound(
                "Comment was not found or you do not have permission to delete it.");
        }

        return NoContent();
    }
}