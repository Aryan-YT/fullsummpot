namespace FullSummpotAPI.Models
{
    public class Community
    {
        public int CommunityID { get; set; }

        public string Name { get; set; }
            = string.Empty;

        public string Description { get; set; }
            = string.Empty;

        public string? BannerUrl { get; set; }

        public int OwnerID { get; set; }

        public DateTime CreatedAt { get; set; }
            = DateTime.Now;
    }
}