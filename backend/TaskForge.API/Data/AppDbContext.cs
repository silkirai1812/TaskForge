using Microsoft.EntityFrameworkCore;
using TaskForge.API.Models;

namespace TaskForge.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Role> Roles { get; set; }

    public DbSet<User> Users { get; set; }

    public DbSet<Project> Projects { get; set; }

    public DbSet<ProjectMember> ProjectMembers { get; set; }

    public DbSet<Issue> Issues { get; set; }

    public DbSet<Comment> Comments { get; set; }

    public DbSet<Activity> Activities { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // -------------------------
        // Role configuration
        // -------------------------

        modelBuilder.Entity<Role>()
            .HasData(
                new Role
                {
                    Id = 1,
                    Name = "Admin"
                },
                new Role
                {
                    Id = 2,
                    Name = "ProjectManager"
                },
                new Role
                {
                    Id = 3,
                    Name = "Developer"
                }
            );

        modelBuilder.Entity<User>()
    .HasData(
        new User
        {
            Id = 1,
            Name = "TaskForge Admin",
            Email = "admin@taskforge.com",
            PasswordHash = "TEMP_HASH",
            RoleId = 1,
            IsActive = true,
            CreatedAt = new DateTime(2026, 9, 6, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 9, 6, 0, 0, 0, DateTimeKind.Utc)
        },
        new User
        {
            Id = 2,
            Name = "Alice Developer",
            Email = "alice@taskforge.com",
            PasswordHash = "TEMP_HASH",
            RoleId = 3,
            IsActive = true,
            CreatedAt = new DateTime(2026, 9, 6, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 9, 6, 0, 0, 0, DateTimeKind.Utc)
        },
        new User
        {
            Id = 3,
            Name = "Bob Manager",
            Email = "bob@taskforge.com",
            PasswordHash = "TEMP_HASH",
            RoleId = 2,
            IsActive = true,
            CreatedAt = new DateTime(2026, 9, 6, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 9, 6, 0, 0, 0, DateTimeKind.Utc)
        }
    );

        modelBuilder.Entity<Role>()
            .Property(r => r.Name)
            .HasMaxLength(50);


        // -------------------------
        // User configuration
        // -------------------------

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .Property(u => u.Name)
            .HasMaxLength(100);

        modelBuilder.Entity<User>()
            .Property(u => u.Email)
            .HasMaxLength(255);

        modelBuilder.Entity<User>()
            .Property(u => u.PasswordHash)
            .HasMaxLength(500);


        // -------------------------
        // Project configuration
        // -------------------------

        modelBuilder.Entity<Project>()
            .Property(p => p.Name)
            .HasMaxLength(150);

        modelBuilder.Entity<Project>()
            .Property(p => p.Status)
            .HasMaxLength(30);

        modelBuilder.Entity<Project>()
            .HasOne(p => p.CreatedBy)
            .WithMany()
            .HasForeignKey(p => p.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);


        // -------------------------
        // ProjectMember configuration
        // -------------------------

        modelBuilder.Entity<ProjectMember>()
            .HasKey(pm => new
            {
                pm.ProjectId,
                pm.UserId
            });

        modelBuilder.Entity<ProjectMember>()
            .HasOne(pm => pm.Project)
            .WithMany(p => p.Members)
            .HasForeignKey(pm => pm.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProjectMember>()
            .HasOne(pm => pm.User)
            .WithMany()
            .HasForeignKey(pm => pm.UserId)
            .OnDelete(DeleteBehavior.Cascade);


        // -------------------------
        // Issue configuration
        // -------------------------

        modelBuilder.Entity<Issue>()
            .HasOne(i => i.Project)
            .WithMany()
            .HasForeignKey(i => i.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Issue>()
            .HasOne(i => i.Reporter)
            .WithMany()
            .HasForeignKey(i => i.ReporterId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Issue>()
            .HasOne(i => i.Assignee)
            .WithMany()
            .HasForeignKey(i => i.AssigneeId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Issue>()
            .Property(i => i.Title)
            .HasMaxLength(250);

        modelBuilder.Entity<Issue>()
            .Property(i => i.Type)
            .HasConversion<string>();

        modelBuilder.Entity<Issue>()
            .Property(i => i.Priority)
            .HasConversion<string>();

        modelBuilder.Entity<Issue>()
            .Property(i => i.Status)
            .HasConversion<string>();


        // -------------------------
        // Comment configuration
        // -------------------------

        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Issue)
            .WithMany(i => i.Comments)
            .HasForeignKey(c => c.IssueId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Comment>()
            .Property(c => c.Content)
            .HasMaxLength(5000);


        // -------------------------
        // Activity configuration
        // -------------------------

        modelBuilder.Entity<Activity>()
            .HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Activity>()
            .HasOne(a => a.Project)
            .WithMany()
            .HasForeignKey(a => a.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Activity>()
            .HasOne(a => a.Issue)
            .WithMany()
            .HasForeignKey(a => a.IssueId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Activity>()
            .Property(a => a.Action)
            .HasMaxLength(500);
    }
}