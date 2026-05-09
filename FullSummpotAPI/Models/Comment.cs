namespace FullSummpotAPI.Models
{
    public class Comment
    {
        public int CommentID { get; set; }

        public string Content { get; set; }
            = string.Empty;

        public int UserID { get; set; }

        public int PostID { get; set; }

        public DateTime CreatedAt { get; set; }
            = DateTime.Now;
    }
}