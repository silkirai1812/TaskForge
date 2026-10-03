using TaskForge.API.DTOs;

namespace TaskForge.API.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> RegisterAsync(RegisterDto dto);
    Task<LoginResponseDto?> LoginAsync(LoginDto dto);
}