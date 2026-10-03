using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TaskForge.API.Migrations
{
    /// <inheritdoc />
    public partial class SeedDevelopmentUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "IsActive", "Name", "PasswordHash", "RoleId", "UpdatedAt" },
                values: new object[,]
                {
                    { 2, new DateTime(2026, 9, 6, 0, 0, 0, 0, DateTimeKind.Utc), "alice@taskforge.com", true, "Alice Developer", "TEMP_HASH", 3, new DateTime(2026, 9, 6, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, new DateTime(2026, 9, 6, 0, 0, 0, 0, DateTimeKind.Utc), "bob@taskforge.com", true, "Bob Manager", "TEMP_HASH", 2, new DateTime(2026, 9, 6, 0, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3);
        }
    }
}
