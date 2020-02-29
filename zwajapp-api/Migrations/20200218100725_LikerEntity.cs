using Microsoft.EntityFrameworkCore.Migrations;

namespace zwajapp_api.Migrations
{
    public partial class LikerEntity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Likers",
                columns: table => new
                {
                    LikerId = table.Column<int>(nullable: false),
                    LikeeId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Likers", x => new { x.LikerId, x.LikeeId });
                    table.ForeignKey(
                        name: "FK_Likers_AspNetUsers_LikeeId",
                        column: x => x.LikeeId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Likers_AspNetUsers_LikerId",
                        column: x => x.LikerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Likers_LikeeId",
                table: "Likers",
                column: "LikeeId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Likers");
        }
    }
}
