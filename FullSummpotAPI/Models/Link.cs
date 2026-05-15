namespace FullSummpotAPI.Models
{
    public class Link
    {
        public int LinkID { get; set; }

        public int UserID { get; set; }

        public int CommunityID { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Url { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}