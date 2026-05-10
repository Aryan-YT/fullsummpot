using Microsoft.AspNetCore.Mvc;
using FullSummpotAPI.Data;
using FullSummpotAPI.Models;
using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FullSummpotAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            AppDbContext context,
            IConfiguration configuration
        )
        {
            _context = context;
            _configuration = configuration;
        }

        // REGISTER

        [HttpPost("register")]

        public IActionResult Register(User user)
        {
            var existingUser = _context.Users
                .FirstOrDefault(u => u.Email == user.Email);

            if (existingUser != null)
            {
                return BadRequest(new
                {
                    message = "Email already exists!"
                });
            }

            // HASH PASSWORD

            user.PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    user.PasswordHash
                );

            _context.Users.Add(user);

            _context.SaveChanges();

            return Ok(new
            {
                message = "User Registered Successfully!"
            });
        }

        // LOGIN

        [HttpPost("login")]

        public IActionResult Login(LoginModel model)
        {
            var user = _context.Users
                .FirstOrDefault(u => u.Email == model.Email);

            if (user == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid Email"
                });
            }

            bool validPassword =
                BCrypt.Net.BCrypt.Verify(
                    model.Password,
                    user.PasswordHash
                );

            if (!validPassword)
            {
                return Unauthorized(new
                {
                    message = "Invalid Password"
                });
            }

            // JWT TOKEN

            var claims = new[]
            {
                new Claim(
                    "UserID",
                    user.UserID.ToString()
                ),

                new Claim(
                    "Username",
                    user.Username
                ),

                new Claim(
                    ClaimTypes.Name,
                    user.Username
                ),

                new Claim(
                    ClaimTypes.Email,
                    user.Email
                ),

                new Claim(
                    ClaimTypes.Role,
                    user.Role
                )
            };

            var key =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        _configuration["Jwt:Key"]!
                    )
                );

            var creds =
                new SigningCredentials(
                    key,
                    SecurityAlgorithms.HmacSha256
                );

            var token =
                new JwtSecurityToken(
                    issuer:
                        _configuration["Jwt:Issuer"],

                    audience:
                        _configuration["Jwt:Audience"],

                    claims: claims,

                    expires:
                        DateTime.Now.AddDays(1),

                    signingCredentials: creds
                );

            var jwt =
                new JwtSecurityTokenHandler()
                    .WriteToken(token);

            return Ok(new
            {
                token = jwt,

                user = new
                {
                    user.UserID,
                    user.Username,
                    user.Email,
                    user.Role,
                    user.Bio,
                    user.ProfileImageUrl
                }
            });
        }

        // GET ALL USERS

        [HttpGet("users")]

        public IActionResult GetUsers()
        {
            return Ok(_context.Users.ToList());
        }

        // GET SINGLE USER PROFILE

        [HttpGet("profile/{id}")]

        public IActionResult GetProfile(int id)
        {
            var user = _context.Users
                .FirstOrDefault(u => u.UserID == id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found"
                });
            }

            return Ok(user);
        }

        // UPDATE PROFILE

        [HttpPut("profile/{id}")]

        public async Task<IActionResult> UpdateProfile(
            int id,
            [FromForm] string username,
            [FromForm] string bio,
            IFormFile? profileImage
        )
        {
            var user = _context.Users
                .FirstOrDefault(u => u.UserID == id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found"
                });
            }
            // SECURITY CHECK

            var currentUserID =
                Request.Form["userID"];

            if (currentUserID !=
                user.UserID.ToString())
            {
                return Unauthorized(
                    new
                    {
                        message =
                            "You can only edit your own profile"
                    }
                );
            }

            user.Username = username;

            user.Bio = bio;

            // IMAGE UPLOAD

            if (profileImage != null)
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
                        profileImage.FileName
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
                    await profileImage
                        .CopyToAsync(stream);
                }

                user.ProfileImageUrl =
                    $"http://localhost:5242/uploads/{fileName}";
            }

            _context.SaveChanges();

            return Ok(user);
        }

        // FOLLOW / UNFOLLOW USER

        [HttpPost("follow")]

        public IActionResult FollowUser(
            FollowUserModel model
        )
        {
            // CANNOT FOLLOW SELF

            if (model.FollowerID ==
                model.FollowingID)
            {
                return BadRequest(new
                {
                    message =
                        "Cannot follow yourself"
                });
            }

            // CHECK EXISTING FOLLOW

            var existingFollow =
                _context.UserFollows
                    .FirstOrDefault(f =>

                        f.FollowerID ==
                            model.FollowerID &&

                        f.FollowingID ==
                            model.FollowingID
                    );

            // UNFOLLOW

            if (existingFollow != null)
            {
                _context.UserFollows
                    .Remove(existingFollow);

                _context.SaveChanges();

                return Ok(new
                {
                    following = false,

                    message =
                        "User unfollowed"
                });
            }

            // FOLLOW

            var follow =
                new UserFollow
                {
                    FollowerID =
                        model.FollowerID,

                    FollowingID =
                        model.FollowingID
                };

            _context.UserFollows.Add(follow);

            _context.SaveChanges();

            return Ok(new
            {
                following = true,

                message =
                    "User followed"
            });
        }

        // GET FOLLOWERS COUNT

        [HttpGet("followers/count/{userID}")]

        public IActionResult GetFollowersCount(
            int userID
        )
        {
            var count =
                _context.UserFollows
                    .Count(f =>
                        f.FollowingID ==
                            userID
                    );

            return Ok(new
            {
                count
            });
        }

        // GET FOLLOWING COUNT

        [HttpGet("following/count/{userID}")]

        public IActionResult GetFollowingCount(
            int userID
        )
        {
            var count =
                _context.UserFollows
                    .Count(f =>
                        f.FollowerID ==
                            userID
                    );

            return Ok(new
            {
                count
            });
        }

        // CHECK FOLLOWING STATUS

        [HttpGet("isfollowing")]

        public IActionResult IsFollowing(
            int followerID,
            int followingID
        )
        {
            var isFollowing =
                _context.UserFollows
                    .Any(f =>

                        f.FollowerID ==
                            followerID &&

                        f.FollowingID ==
                            followingID
                    );

            return Ok(new
            {
                isFollowing
            });
        }

        // GET FOLLOWERS LIST

        [HttpGet("followers/{userID}")]

        public IActionResult GetFollowers(
            int userID
        )
        {
            var followers =
                _context.UserFollows

                    .Where(f =>
                        f.FollowingID ==
                            userID
                    )

                    .Join(
                        _context.Users,

                        follow =>
                            follow.FollowerID,

                        user =>
                            user.UserID,

                        (follow, user) =>
                            user
                    )

                    .ToList();

            return Ok(followers);
        }

        // GET FOLLOWING LIST

        [HttpGet("following/{userID}")]

        public IActionResult GetFollowing(
            int userID
        )
        {
            var following =
                _context.UserFollows

                    .Where(f =>
                        f.FollowerID ==
                            userID
                    )

                    .Join(
                        _context.Users,

                        follow =>
                            follow.FollowingID,

                        user =>
                            user.UserID,

                        (follow, user) =>
                            user
                    )

                    .ToList();

            return Ok(following);
        }

        // SEARCH USERS

        [HttpGet("search")]

        public IActionResult SearchUsers(
            string username
        )
        {
            var users =
                _context.Users

                    .Where(u =>
                        u.Username
                            .ToLower()
                            .Contains(
                                username.ToLower()
                            )
                    )

                    .Select(u => new
                    {
                        u.UserID,

                        u.Username,

                        u.ProfileImageUrl
                    })

                    .ToList();

            return Ok(users);
        }
    }

}