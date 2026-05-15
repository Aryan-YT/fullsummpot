using Microsoft.AspNetCore.Mvc;
using FullSummpotAPI.Data;
using FullSummpotAPI.Models;

namespace FullSummpotAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // Helper: check if user is admin
        private bool IsAdmin(int userID)
        {
            var user = _context.Users.Find(userID);
            return user != null && user.Role == "Admin";
        }

        // DASHBOARD STATS
        [HttpGet("stats")]
        public IActionResult GetStats(int adminID)
        {
            if (!IsAdmin(adminID)) return Unauthorized(new { message = "Admin access required" });

            return Ok(new
            {
                TotalUsers = _context.Users.Count(),
                TotalCommunities = _context.Communities.Count(),
                TotalPosts = _context.Posts.Count(),
                TotalLinks = _context.Links.Count(),
                TotalClicks = _context.LinkClicks.Count()
            });
        }

        // GET ALL USERS
        [HttpGet("users")]
        public IActionResult GetUsers(int adminID)
        {
            if (!IsAdmin(adminID)) return Unauthorized(new { message = "Admin access required" });

            var users = _context.Users.Select(u => new
            {
                u.UserID,
                u.Username,
                u.Email,
                u.Role,
                u.Bio,
                u.ProfileImageUrl,
                CommunitiesOwned = _context.Communities.Count(c => c.OwnerID == u.UserID),
                PostsCount = _context.Posts.Count(p => p.UserID == u.UserID),
                LinksCount = _context.Links.Count(l => l.UserID == u.UserID)
            }).ToList();

            return Ok(users);
        }

        // DELETE USER (admin)
        [HttpDelete("users/{id}")]
        public IActionResult DeleteUser(int id, int adminID)
        {
            if (!IsAdmin(adminID)) return Unauthorized(new { message = "Admin access required" });

            var user = _context.Users.Find(id);
            if (user == null) return NotFound();

            // Remove user's data
            var posts = _context.Posts.Where(p => p.UserID == id).ToList();
            _context.Posts.RemoveRange(posts);

            var links = _context.Links.Where(l => l.UserID == id).ToList();
            foreach (var link in links)
            {
                var clicks = _context.LinkClicks.Where(c => c.LinkID == link.LinkID).ToList();
                _context.LinkClicks.RemoveRange(clicks);
            }
            _context.Links.RemoveRange(links);

            var memberships = _context.CommunityMembers.Where(m => m.UserID == id).ToList();
            _context.CommunityMembers.RemoveRange(memberships);

            _context.Users.Remove(user);
            _context.SaveChanges();

            return Ok(new { message = "User deleted" });
        }

        // CHANGE USER ROLE
        [HttpPut("users/{id}/role")]
        public IActionResult ChangeRole(int id, int adminID, [FromBody] RoleModel model)
        {
            if (!IsAdmin(adminID)) return Unauthorized(new { message = "Admin access required" });

            var user = _context.Users.Find(id);
            if (user == null) return NotFound();

            user.Role = model.Role;
            _context.SaveChanges();

            return Ok(new { message = $"User role changed to {model.Role}" });
        }

        // GET ALL COMMUNITIES
        [HttpGet("communities")]
        public IActionResult GetCommunities(int adminID)
        {
            if (!IsAdmin(adminID)) return Unauthorized(new { message = "Admin access required" });

            var communities = _context.Communities.Select(c => new
            {
                c.CommunityID,
                c.Name,
                c.Description,
                c.Niche,
                c.BannerUrl,
                c.OwnerID,
                c.CreatedAt,
                OwnerName = _context.Users.Where(u => u.UserID == c.OwnerID).Select(u => u.Username).FirstOrDefault(),
                MemberCount = _context.CommunityMembers.Count(m => m.CommunityID == c.CommunityID),
                PostCount = _context.Posts.Count(p => p.CommunityID == c.CommunityID),
                LinkCount = _context.Links.Count(l => l.CommunityID == c.CommunityID)
            }).ToList();

            return Ok(communities);
        }

        // DELETE COMMUNITY (admin)
        [HttpDelete("communities/{id}")]
        public IActionResult DeleteCommunity(int id, int adminID)
        {
            if (!IsAdmin(adminID)) return Unauthorized(new { message = "Admin access required" });

            var community = _context.Communities.Find(id);
            if (community == null) return NotFound();

            // Remove all related data
            var members = _context.CommunityMembers.Where(m => m.CommunityID == id).ToList();
            _context.CommunityMembers.RemoveRange(members);

            var posts = _context.Posts.Where(p => p.CommunityID == id).ToList();
            _context.Posts.RemoveRange(posts);

            var links = _context.Links.Where(l => l.CommunityID == id).ToList();
            foreach (var link in links)
            {
                var clicks = _context.LinkClicks.Where(c => c.LinkID == link.LinkID).ToList();
                _context.LinkClicks.RemoveRange(clicks);
            }
            _context.Links.RemoveRange(links);

            _context.Communities.Remove(community);
            _context.SaveChanges();

            return Ok(new { message = "Community deleted" });
        }

        // GET ALL POSTS
        [HttpGet("posts")]
        public IActionResult GetPosts(int adminID)
        {
            if (!IsAdmin(adminID)) return Unauthorized(new { message = "Admin access required" });

            var posts = _context.Posts.Select(p => new
            {
                p.PostID,
                p.Title,
                p.Content,
                p.ImageUrl,
                p.UserID,
                p.CommunityID,
                p.CreatedAt,
                Username = _context.Users.Where(u => u.UserID == p.UserID).Select(u => u.Username).FirstOrDefault(),
                CommunityName = _context.Communities.Where(c => c.CommunityID == p.CommunityID).Select(c => c.Name).FirstOrDefault(),
                LikesCount = _context.PostLikes.Count(l => l.PostID == p.PostID),
                CommentsCount = _context.Comments.Count(c => c.PostID == p.PostID)
            }).OrderByDescending(p => p.CreatedAt).ToList();

            return Ok(posts);
        }

        // DELETE POST (admin)
        [HttpDelete("posts/{id}")]
        public IActionResult DeletePost(int id, int adminID)
        {
            if (!IsAdmin(adminID)) return Unauthorized(new { message = "Admin access required" });

            var post = _context.Posts.Find(id);
            if (post == null) return NotFound();

            var likes = _context.PostLikes.Where(l => l.PostID == id).ToList();
            _context.PostLikes.RemoveRange(likes);

            var comments = _context.Comments.Where(c => c.PostID == id).ToList();
            _context.Comments.RemoveRange(comments);

            _context.Posts.Remove(post);
            _context.SaveChanges();

            return Ok(new { message = "Post deleted" });
        }

        // GET ALL LINKS
        [HttpGet("links")]
        public IActionResult GetLinks(int adminID)
        {
            if (!IsAdmin(adminID)) return Unauthorized(new { message = "Admin access required" });

            var links = _context.Links.Select(l => new
            {
                l.LinkID,
                l.Title,
                l.Url,
                l.UserID,
                l.CommunityID,
                l.CreatedAt,
                Username = _context.Users.Where(u => u.UserID == l.UserID).Select(u => u.Username).FirstOrDefault(),
                CommunityName = _context.Communities.Where(c => c.CommunityID == l.CommunityID).Select(c => c.Name).FirstOrDefault(),
                ClickCount = _context.LinkClicks.Count(c => c.LinkID == l.LinkID)
            }).OrderByDescending(l => l.CreatedAt).ToList();

            return Ok(links);
        }

        // DELETE LINK (admin)
        [HttpDelete("links/{id}")]
        public IActionResult DeleteLink(int id, int adminID)
        {
            if (!IsAdmin(adminID)) return Unauthorized(new { message = "Admin access required" });

            var link = _context.Links.Find(id);
            if (link == null) return NotFound();

            var clicks = _context.LinkClicks.Where(c => c.LinkID == link.LinkID).ToList();
            _context.LinkClicks.RemoveRange(clicks);

            _context.Links.Remove(link);
            _context.SaveChanges();

            return Ok(new { message = "Link deleted" });
        }
    }

    public class RoleModel
    {
        public string Role { get; set; } = "User";
    }
}
