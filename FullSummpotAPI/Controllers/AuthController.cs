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

        public AuthController(AppDbContext context, IConfiguration configuration)
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
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);

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

            bool validPassword = BCrypt.Net.BCrypt.Verify(
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
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuration["Jwt:Key"]!
                )
            );

            var creds = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler()
                .WriteToken(token);

            return Ok(new
            {
                token = jwt,
                username = user.Username,
                role = user.Role
            });
        }

        // GET USERS
        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            return Ok(_context.Users.ToList());
        }
    }
}