namespace MedicalAPI.Models.ProcessReportModels
{
    public class ChartModel
    {
        public string? Name { get; set; }
        public List<string>? Values { get; set; }
        public string? Min { get; set; }
        public string? Max { get; set; }
    }
}
