using Microsoft.AspNetCore.Mvc;
using FullSummpotAPI.Data;
using FullSummpotAPI.Models;

namespace FullSummpotAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PostsController(AppDbContext context)
        {
            _context = context;
        }

        // CREATE POST

        [HttpPost]

        public IActionResult CreatePost(Post post)
        {
            // FIND COMMUNITY

            var community = _context.Communities
                .FirstOrDefault(c => c.CommunityID == post.CommunityID);

            // COMMUNITY NOT FOUND

            if (community == null)
            {
                return NotFound(new
                {
                    message = "Community not found"
                });
            }

            // ONLY OWNER CAN POST

            if (community.OwnerID != post.UserID)
            {
                return BadRequest(new
                {
                    message = "Only community owner can post"
                });
            }

            // CREATE POST

            _context.Posts.Add(post);

            _context.SaveChanges();

            return Ok(post);
        }

        // GET ALL POSTS

        [HttpGet]

        public IActionResult GetPosts()
        {
            var posts = _context.Posts
                .OrderByDescending(p => p.CreatedAt)
                .ToList();

            return Ok(posts);
        }

        // GET POSTS BY COMMUNITY

        [HttpGet("community/{communityID}")]

        public IActionResult GetCommunityPosts(int communityID)
        {
            var posts = _context.Posts
                .Where(p => p.CommunityID == communityID)
                .OrderByDescending(p => p.CreatedAt)
                .ToList();

            return Ok(posts);
        }
    }
}