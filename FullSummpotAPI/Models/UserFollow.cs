namespace FullSummpotAPI.Models
{
    public class UserFollow
    {
        public int UserFollowID { get; set; }

        public int FollowerID { get; set; }

        public int FollowingID { get; set; }

        public DateTime CreatedAt { get; set; }
            = DateTime.Now;
    }
}