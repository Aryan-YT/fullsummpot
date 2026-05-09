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
            var community = _context.Communities
                .FirstOrDefault(c => c.CommunityID == post.CommunityID);

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

        // LIKE / UNLIKE POST

        [HttpPost("like")]

        public IActionResult LikePost(LikePostModel model)
        {
            var existingLike = _context.PostLikes
                .FirstOrDefault(l =>
                    l.UserID == model.UserID &&
                    l.PostID == model.PostID
                );

            // UNLIKE

            if (existingLike != null)
            {
                _context.PostLikes.Remove(existingLike);

                _context.SaveChanges();

                return Ok(new
                {
                    message = "Post Unliked"
                });
            }

            // LIKE

            var like = new PostLike
            {
                UserID = model.UserID,
                PostID = model.PostID
            };

            _context.PostLikes.Add(like);

            _context.SaveChanges();

            return Ok(new
            {
                message = "Post Liked"
            });
        }

        // GET POST LIKE COUNT

        [HttpGet("{postID}/likes")]

        public IActionResult GetPostLikes(int postID)
        {
            var likes = _context.PostLikes
                .Count(l => l.PostID == postID);

            return Ok(new
            {
                count = likes
            });
        }
    }
}