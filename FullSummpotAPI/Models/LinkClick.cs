namespace FullSummpotAPI.Models
{
    public class LinkClick
    {
        public int LinkClickID { get; set; }

        public int LinkID { get; set; }

        public int ClickedByUserID { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}