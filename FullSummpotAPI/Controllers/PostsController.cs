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