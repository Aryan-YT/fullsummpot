namespace FullSummpotAPI.Models
{
    public class User
    {
        public int UserID { get; set; }

        public string Username { get; set; }
            = string.Empty;

        public string Email { get; set; }
            = string.Empty;

        public string PasswordHash { get; set; }
            = string.Empty;

        public string Role { get; set; }
            = "User";

        public string? Bio { get; set; }

        public string? ProfileImageUrl { get; set; }

        public DateTime CreatedAt { get; set; }
            = DateTime.Now;
    }
}