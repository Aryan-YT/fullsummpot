namespace FullSummpotAPI.Models
{
    public class Post
    {
        public int PostID { get; set; }

        public string Title { get; set; }

        public string Content { get; set; }

        public int UserID { get; set; }

        public int CommunityID { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}