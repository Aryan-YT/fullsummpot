using Microsoft.EntityFrameworkCore;
using FullSummpotAPI.Models;

namespace FullSummpotAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        public DbSet<Community> Communities { get; set; }

        public DbSet<CommunityMember> CommunityMembers { get; set; }

        public DbSet<Post> Posts { get; set; }

        public DbSet<PostLike> PostLikes { get; set; }

        public DbSet<Comment> Comments { get; set; }
    }
}