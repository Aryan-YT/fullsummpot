namespace FullSummpotAPI.Models
{
    public class PostLike
    {
        public int PostLikeID { get; set; }

        public int UserID { get; set; }

        public int PostID { get; set; }

        public DateTime LikedAt { get; set; }
            = DateTime.Now;
    }
}