using Microsoft.AspNetCore.Mvc;
using TaskForge.API.DTOs;
using TaskForge.API.Interfaces;

namespace TaskForge.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<LoginResponseDto>> Register(
        RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);

        if (result == null)
        {
            return BadRequest(
                "Email already exists or the selected role is invalid.");
        }

        return StatusCode(201, result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(
        LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);

        if (result == null)
        {
            return Unauthorized("Invalid email or password.");
        }

        return Ok(result);
    }
}