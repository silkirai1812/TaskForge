using TaskForge.API.DTOs;

namespace TaskForge.API.Interfaces;

public interface IProjectService
{
    Task<IEnumerable<ProjectDto>> GetAllAsync();

    Task<ProjectDto?> GetByIdAsync(int id);

    Task<ProjectDto> CreateAsync(CreateProjectDto dto);

    Task<ProjectDto?> UpdateAsync(int id, UpdateProjectDto dto);

    Task<bool> DeleteAsync(int id);

    Task<IEnumerable<ProjectMemberDto>> GetMembersAsync(int projectId);

    Task<bool> AddMemberAsync(int projectId, int userId);

    Task<bool> RemoveMemberAsync(int projectId, int userId);
}