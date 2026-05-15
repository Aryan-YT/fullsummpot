using System.Linq;
using Microsoft.AspNetCore.Mvc;
using FullSummpotAPI.Data;
using FullSummpotAPI.Models;

namespace FullSummpotAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommunitiesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CommunitiesController(AppDbContext context)
        {
            _context = context;
        }

        // CREATE COMMUNITY

        [HttpPost]

        public async Task<IActionResult> CreateCommunity(
            [FromForm] string name,
            [FromForm] string description,
            [FromForm] int ownerID,
            [FromForm] string? niche,
            IFormFile? banner
        )
        {
            string? bannerUrl = null;

            if (banner != null)
            {
                var uploadsFolder = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot/uploads"
                );

                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var fileName =
                    Guid.NewGuid().ToString() +
                    Path.GetExtension(banner.FileName);

                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await banner.CopyToAsync(stream);
                }

                bannerUrl = $"http://localhost:5242/uploads/{fileName}";
            }

            var community = new Community
            {
                Name = name,
                Description = description,
                OwnerID = ownerID,
                Niche = niche ?? "",
                BannerUrl = bannerUrl
            };

            _context.Communities.Add(community);
            _context.SaveChanges();

            // Auto-join owner
            var alreadyJoined = _context.CommunityMembers
                .Any(m => m.UserID == ownerID && m.CommunityID == community.CommunityID);
            if (!alreadyJoined)
            {
                _context.CommunityMembers.Add(new CommunityMember
                {
                    UserID = ownerID,
                    CommunityID = community.CommunityID
                });
                _context.SaveChanges();
            }

            return Ok(community);
        }

        // GET ALL COMMUNITIES (enriched with member count and isMember)

        [HttpGet]

        public IActionResult GetCommunities(int? userID)
        {
            var communities = _context.Communities.ToList();

            var result = communities.Select(c => new
            {
                c.CommunityID,
                c.Name,
                c.Description,
                c.BannerUrl,
                c.Niche,
                c.OwnerID,
                c.CreatedAt,
                MemberCount = _context.CommunityMembers
                    .Count(m => m.CommunityID == c.CommunityID),
                IsMember = userID.HasValue && _context.CommunityMembers
                    .Any(m => m.CommunityID == c.CommunityID && m.UserID == userID.Value)
            });

            return Ok(result);
        }

        // GET SINGLE COMMUNITY

        [HttpGet("{id}")]

        public IActionResult GetCommunity(int id, int? userID)
        {
            var community = _context.Communities
                .FirstOrDefault(c => c.CommunityID == id);

            if (community == null)
            {
                return NotFound(new { message = "Community not found" });
            }

            var memberCount = _context.CommunityMembers
                .Count(m => m.CommunityID == id);

            var isMember = userID.HasValue && _context.CommunityMembers
                .Any(m => m.CommunityID == id && m.UserID == userID.Value);

            return Ok(new
            {
                community.CommunityID,
                community.Name,
                community.Description,
                community.BannerUrl,
                community.Niche,
                community.OwnerID,
                community.CreatedAt,
                MemberCount = memberCount,
                IsMember = isMember
            });
        }

        // UPDATE COMMUNITY

        [HttpPut("{id}")]

        public async Task<IActionResult> UpdateCommunity(
            int id,
            [FromForm] string name,
            [FromForm] string description,
            [FromForm] string? niche,
            IFormFile? banner
        )
        {
            var community = _context.Communities
                .FirstOrDefault(c => c.CommunityID == id);

            if (community == null) return NotFound();

            community.Name = name;
            community.Description = description;
            if (niche != null) community.Niche = niche;

            if (banner != null)
            {
                var uploadsFolder = Path.Combine(
                    Directory.GetCurrentDirectory(), "wwwroot/uploads");

                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = Guid.NewGuid().ToString() +
                    Path.GetExtension(banner.FileName);

                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await banner.CopyToAsync(stream);
                }

                community.BannerUrl = $"http://localhost:5242/uploads/{fileName}";
            }

            _context.SaveChanges();
            return Ok(community);
        }

        // DELETE COMMUNITY

        [HttpDelete("{id}")]

        public IActionResult DeleteCommunity(int id)
        {
            var community = _context.Communities
                .FirstOrDefault(c => c.CommunityID == id);

            if (community == null) return NotFound();

            // CASCADE DELETE MEMBERS
            var members = _context.CommunityMembers.Where(m => m.CommunityID == id).ToList();
            _context.CommunityMembers.RemoveRange(members);

            // CASCADE DELETE POSTS (and their likes/comments)
            var posts = _context.Posts.Where(p => p.CommunityID == id).ToList();
            foreach (var p in posts) {
                _context.PostLikes.RemoveRange(_context.PostLikes.Where(l => l.PostID == p.PostID));
                _context.Comments.RemoveRange(_context.Comments.Where(c => c.PostID == p.PostID));
            }
            _context.Posts.RemoveRange(posts);

            // CASCADE DELETE LINKS (and clicks)
            var links = _context.Links.Where(l => l.CommunityID == id).ToList();
            foreach (var link in links)
            {
                var clicks = _context.LinkClicks.Where(c => c.LinkID == link.LinkID).ToList();
                _context.LinkClicks.RemoveRange(clicks);
            }
            _context.Links.RemoveRange(links);

            _context.Communities.Remove(community);
            _context.SaveChanges();

            return Ok(new { message = "Community Deleted" });
        }

        // JOIN COMMUNITY

        [HttpPost("join")]

        public IActionResult JoinCommunity(JoinCommunityModel model)
        {
            var alreadyJoined = _context.CommunityMembers
                .FirstOrDefault(m =>
                    m.UserID == model.UserID &&
                    m.CommunityID == model.CommunityID);

            if (alreadyJoined != null)
            {
                return BadRequest(new { message = "Already Joined" });
            }

            var member = new CommunityMember
            {
                UserID = model.UserID,
                CommunityID = model.CommunityID
            };

            _context.CommunityMembers.Add(member);
            _context.SaveChanges();

            return Ok(new { message = "Joined Community!" });
        }

        // LEAVE COMMUNITY

        [HttpPost("leave")]

        public IActionResult LeaveCommunity(JoinCommunityModel model)
        {
            // Prevent owner from leaving
            var community = _context.Communities
                .FirstOrDefault(c => c.CommunityID == model.CommunityID);
            if (community != null && community.OwnerID == model.UserID)
            {
                return BadRequest(new { message = "Owner cannot leave their own community. Delete it instead." });
            }

            var membership = _context.CommunityMembers
                .FirstOrDefault(m =>
                    m.UserID == model.UserID &&
                    m.CommunityID == model.CommunityID);

            if (membership == null)
            {
                return BadRequest(new { message = "Not a member" });
            }

            _context.CommunityMembers.Remove(membership);
            _context.SaveChanges();

            return Ok(new { message = "Left Community" });
        }

        // GET JOINED COMMUNITIES

        [HttpGet("joined/{userID}")]

        public IActionResult GetJoinedCommunities(int userID)
        {
            var joinedCommunities = _context.CommunityMembers
                .Where(cm => cm.UserID == userID)
                .Join(
                    _context.Communities,
                    cm => cm.CommunityID,
                    c => c.CommunityID,
                    (cm, c) => c
                )
                .ToList();

            return Ok(joinedCommunities);
        }
    }
}