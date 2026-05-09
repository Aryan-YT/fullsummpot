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

        public IActionResult CreateCommunity(Community community)
        {
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

        // JOIN COMMUNITY

        [HttpPost("join")]

        public IActionResult JoinCommunity(JoinCommunityModel model)
        {
            var alreadyJoined = _context.CommunityMembers
                .FirstOrDefault(m =>
                    m.UserID == model.UserID &&
                    m.CommunityID == model.CommunityID
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
    }
}