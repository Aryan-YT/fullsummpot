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

            return Ok(new
            {
                message = "Community Created!"
            });
        }

        // GET ALL COMMUNITIES
        [HttpGet]
        public IActionResult GetCommunities()
        {
            var communities = _context.Communities.ToList();

            return Ok(communities);
        }
    }
}