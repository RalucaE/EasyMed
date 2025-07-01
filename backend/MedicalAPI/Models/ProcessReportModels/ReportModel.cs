using Newtonsoft.Json;

namespace MedicalAPI.Models.ProcessReportModels
{
    public class ReportModel
    {
        [JsonProperty("Test")]
        public string Test { get; set; }

        [JsonProperty("Rezultat")]
        public string Rezultat { get; set; }

        [JsonProperty("UM")]
        public string UM { get; set; }

        [JsonProperty("Interval de referinta")]
        public string IntervalDeReferinta { get; set; }

        public ReportModel(string Test, string Rezultat, string UM, string IntervalDeReferinta)
        {      
            this.Test = Test;
            this.Rezultat = Rezultat;
            this.UM = UM;
            this.IntervalDeReferinta = IntervalDeReferinta;
        }
    }
}