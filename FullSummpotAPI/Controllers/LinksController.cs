using Microsoft.AspNetCore.Mvc;
using FullSummpotAPI.Data;
using FullSummpotAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FullSummpotAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LinksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LinksController(AppDbContext context)
        {
            _context = context;
        }

        // CREATE LINK
        [HttpPost]
        public IActionResult CreateLink(Link link)
        {
            _context.Links.Add(link);
            _context.SaveChanges();
            return Ok(link);
        }

        // DELETE LINK
        [HttpDelete("{linkID}")]
        public IActionResult DeleteLink(int linkID)
        {
            var link = _context.Links.Find(linkID);
            if (link == null) return NotFound(new { message = "Link not found" });

            var clicks = _context.LinkClicks.Where(c => c.LinkID == linkID).ToList();
            _context.LinkClicks.RemoveRange(clicks);

            _context.Links.Remove(link);
            _context.SaveChanges();
            return Ok(new { message = "Link deleted" });
        }

        // EDIT LINK
        [HttpPut("{linkID}")]
        public IActionResult EditLink(int linkID, [FromBody] Link updated)
        {
            var link = _context.Links.Find(linkID);
            if (link == null) return NotFound(new { message = "Link not found" });

            link.Title = updated.Title;
            link.Url = updated.Url;
            _context.SaveChanges();
            return Ok(link);
        }

        // GET LINKS OF USER
        [HttpGet("user/{userID}")]
        public IActionResult GetUserLinks(int userID)
        {
            var links = _context.Links
                .Where(l => l.UserID == userID)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new
                {
                    l.LinkID,
                    l.UserID,
                    l.CommunityID,
                    l.Title,
                    l.Url,
                    l.CreatedAt,
                    Username = _context.Users
                        .Where(u => u.UserID == l.UserID)
                        .Select(u => u.Username)
                        .FirstOrDefault(),
                    ClickCount = _context.LinkClicks.Count(c => c.LinkID == l.LinkID)
                })
                .ToList();

            return Ok(links);
        }

        // GET LINKS BY COMMUNITY
        [HttpGet("community/{communityID}")]
        public IActionResult GetCommunityLinks(int communityID, int? userID)
        {
            var links = _context.Links
                .Where(l => l.CommunityID == communityID)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new
                {
                    l.LinkID,
                    l.UserID,
                    l.CommunityID,
                    l.Title,
                    l.Url,
                    l.CreatedAt,
                    Username = _context.Users
                        .Where(u => u.UserID == l.UserID)
                        .Select(u => u.Username)
                        .FirstOrDefault(),
                    ClickCount = _context.LinkClicks.Count(c => c.LinkID == l.LinkID),
                    IsClickedByMe = userID.HasValue && _context.LinkClicks
                        .Any(c => c.LinkID == l.LinkID && c.ClickedByUserID == userID.Value)
                })
                .ToList();

            return Ok(links);
        }

        // TRACK CLICK
        [HttpPost("click")]
        public IActionResult TrackClick(LinkClick click)
        {
            var alreadyClicked = _context.LinkClicks
                .FirstOrDefault(c =>
                    c.LinkID == click.LinkID &&
                    c.ClickedByUserID == click.ClickedByUserID
                );

            if (alreadyClicked == null)
            {
                click.CreatedAt = DateTime.UtcNow;
                _context.LinkClicks.Add(click);
                _context.SaveChanges();
            }

            return Ok(new { message = "Click tracked" });
        }

        // GET SUPPORTERS OF CREATOR (who clicked creator's links)
        [HttpGet("supporters/{userID}")]
        public IActionResult GetSupporters(int userID)
        {
            var supporters = _context.LinkClicks
                .Join(
                    _context.Links,
                    click => click.LinkID,
                    link => link.LinkID,
                    (click, link) => new { click, link }
                )
                .Where(x => x.link.UserID == userID)
                .Join(
                    _context.Users,
                    x => x.click.ClickedByUserID,
                    user => user.UserID,
                    (x, user) => new
                    {
                        user.UserID,
                        user.Username,
                        Title = x.link.Title,
                        Url = x.link.Url,
                        x.click.CreatedAt
                    }
                )
                .OrderByDescending(x => x.CreatedAt)
                .ToList();

            return Ok(supporters);
        }

        // GET CLICKS MADE BY A USER (their outgoing support history)
        [HttpGet("myclicks/{userID}")]
        public IActionResult GetMyClicks(int userID)
        {
            var clicks = _context.LinkClicks
                .Join(
                    _context.Links,
                    click => click.LinkID,
                    link => link.LinkID,
                    (click, link) => new { click, link }
                )
                .Where(x => x.click.ClickedByUserID == userID)
                .Join(
                    _context.Users,
                    x => x.link.UserID,
                    owner => owner.UserID,
                    (x, owner) => new
                    {
                        x.link.LinkID,
                        x.link.Title,
                        x.link.Url,
                        SupporterUserID = owner.UserID,
                        SupporterUsername = owner.Username,
                        x.click.CreatedAt
                    }
                )
                .OrderByDescending(x => x.CreatedAt)
                .ToList();

            return Ok(clicks);
        }

        // LEADERBOARD - top creators by clicks received
        [HttpGet("leaderboard")]
        public IActionResult GetLeaderboard()
        {
            var leaderboard = _context.Users
                .Select(u => new
                {
                    u.UserID,
                    u.Username,
                    u.ProfileImageUrl,
                    LinksSubmitted = _context.Links.Count(l => l.UserID == u.UserID),
                    ClicksReceived = _context.LinkClicks
                        .Join(_context.Links, c => c.LinkID, l => l.LinkID, (c, l) => l)
                        .Count(l => l.UserID == u.UserID),
                    ClicksGiven = _context.LinkClicks.Count(c => c.ClickedByUserID == u.UserID),
                    Points = _context.LinkClicks
                        .Join(_context.Links, c => c.LinkID, l => l.LinkID, (c, l) => l)
                        .Count(l => l.UserID == u.UserID) * 10
                        + _context.LinkClicks.Count(c => c.ClickedByUserID == u.UserID) * 5
                })
                .OrderByDescending(x => x.Points)
                .Take(20)
                .ToList()
                .Select((x, i) => new
                {
                    Rank = i + 1,
                    x.UserID,
                    x.Username,
                    x.ProfileImageUrl,
                    x.LinksSubmitted,
                    x.ClicksReceived,
                    x.ClicksGiven,
                    x.Points
                });

            return Ok(leaderboard);
        }

        // GET POINTS FOR USER
        [HttpGet("points/{userID}")]
        public IActionResult GetPoints(int userID)
        {
            var clicksReceived = _context.LinkClicks
                .Join(_context.Links, c => c.LinkID, l => l.LinkID, (c, l) => l)
                .Count(l => l.UserID == userID);

            var clicksGiven = _context.LinkClicks
                .Count(c => c.ClickedByUserID == userID);

            var today = DateTime.UtcNow.Date;

            var clicksGivenToday = _context.LinkClicks
                .Count(c => c.ClickedByUserID == userID && c.CreatedAt >= today);

            var pointsEarnedToday = clicksGivenToday * 5;

            return Ok(new
            {
                AvailablePoints = clicksReceived * 10 + clicksGiven * 5,
                PointsEarnedToday = pointsEarnedToday,
                ViewsGivenToday = clicksGivenToday
            });
        }
    }
}