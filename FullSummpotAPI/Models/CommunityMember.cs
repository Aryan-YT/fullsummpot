namespace FullSummpotAPI.Models
{
    public class CommunityMember
    {
        public int CommunityMemberID { get; set; }

        public int UserID { get; set; }

        public int CommunityID { get; set; }

        public DateTime JoinedAt { get; set; } = DateTime.Now;
    }
}