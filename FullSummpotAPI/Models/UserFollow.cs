namespace FullSummpotAPI.Models
{
    public class UserFollow
    {
        public int UserFollowID { get; set; }

        // USER WHO FOLLOWS

        public int FollowerID { get; set; }

        // USER WHO IS BEING FOLLOWED

        public int FollowingID { get; set; }

        public DateTime CreatedAt { get; set; }
            = DateTime.Now;
    }
}