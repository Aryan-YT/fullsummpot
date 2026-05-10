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
            IFormFile? banner
        )
        {
            string? bannerUrl = null;

            // BANNER UPLOAD

            if (banner != null)
            {
                var uploadsFolder = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot/uploads"
                );

                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(
                        uploadsFolder
                    );
                }

                var fileName =
                    Guid.NewGuid().ToString() +
                    Path.GetExtension(
                        banner.FileName
                    );

                var filePath = Path.Combine(
                    uploadsFolder,
                    fileName
                );

                using (var stream =
                    new FileStream(
                        filePath,
                        FileMode.Create
                    ))
                {
                    await banner.CopyToAsync(stream);
                }

                bannerUrl =
                    $"http://localhost:5242/uploads/{fileName}";
            }

            var community = new Community
            {
                Name = name,
                Description = description,
                OwnerID = ownerID,
                BannerUrl = bannerUrl
            };

            _context.Communities.Add(community);

            _context.SaveChanges();

            return Ok(community);
        }

        // GET ALL COMMUNITIES

        [HttpGet]

        public IActionResult GetCommunities()
        {
            var communities = _context.Communities.ToList();

            return Ok(communities);
        }

        // GET SINGLE COMMUNITY

        [HttpGet("{id}")]

        public IActionResult GetCommunity(int id)
        {
            var community = _context.Communities
                .FirstOrDefault(c => c.CommunityID == id);

            if (community == null)
            {
                return NotFound(new
                {
                    message = "Community not found"
                });
            }

            return Ok(community);
        }

        // UPDATE COMMUNITY

        [HttpPut("{id}")]

        public async Task<IActionResult> UpdateCommunity(
            int id,
            [FromForm] string name,
            [FromForm] string description,
            IFormFile? banner
        )
        {
            var community = _context.Communities
                .FirstOrDefault(c => c.CommunityID == id);

            if (community == null)
            {
                return NotFound();
            }

            community.Name = name;

            community.Description = description;

            // NEW BANNER

            if (banner != null)
            {
                var uploadsFolder = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot/uploads"
                );

                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(
                        uploadsFolder
                    );
                }

                var fileName =
                    Guid.NewGuid().ToString() +
                    Path.GetExtension(
                        banner.FileName
                    );

                var filePath = Path.Combine(
                    uploadsFolder,
                    fileName
                );

                using (var stream =
                    new FileStream(
                        filePath,
                        FileMode.Create
                    ))
                {
                    await banner.CopyToAsync(stream);
                }

                community.BannerUrl =
                    $"http://localhost:5242/uploads/{fileName}";
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

            if (community == null)
            {
                return NotFound();
            }

            _context.Communities.Remove(community);

            _context.SaveChanges();

            return Ok(new
            {
                message = "Community Deleted"
            });
        }

        // JOIN COMMUNITY

        [HttpPost("join")]

        public IActionResult JoinCommunity(
            JoinCommunityModel model
        )
        {
            var alreadyJoined =
                _context.CommunityMembers
                    .FirstOrDefault(m =>
                        m.UserID == model.UserID &&
                        m.CommunityID ==
                        model.CommunityID
                    );

            if (alreadyJoined != null)
            {
                return BadRequest(new
                {
                    message = "Already Joined"
                });
            }

            var member = new CommunityMember
            {
                UserID = model.UserID,
                CommunityID = model.CommunityID
            };

            _context.CommunityMembers.Add(member);

            _context.SaveChanges();

            return Ok(new
            {
                message = "Joined Community!"
            });
        }

        // GET JOINED COMMUNITIES

        [HttpGet("joined/{userID}")]

        public IActionResult GetJoinedCommunities(
            int userID
        )
        {
            var joinedCommunities =
                _context.CommunityMembers
                    .Where(cm =>
                        cm.UserID == userID
                    )
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