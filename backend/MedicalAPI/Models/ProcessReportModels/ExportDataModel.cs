namespace MedicalAPI.Models.ProcessReportModels
{
    public class ExportDataModel
    {
        public string Id { get; set; }
        public List<ReportModel> ExtractedData { get; set; }
        public string ReportDate { get; set; }
    }
}
