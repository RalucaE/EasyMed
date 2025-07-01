using MedicalAPI.Models.ProcessReportModels;
using System.Text.RegularExpressions;
namespace MedicalAPI.Services
{
    public class PatientsService
    {
        public List<ChartModel> CompareReports(List<ExportDataModel> reports)
        {
            var parameterMapping = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { "Nr. eritrocite", "Numar de eritrocite (RBC)" },
                { "Hemoglobina", "Hemoglobina (HGB)" },
                { "Hematocrit", "Hematocrit (HCT)" },
                { "VEM", "Volumul mediu eritrocitar (MCV)" },
                { "HEM", "Hemoglobina eritrocitara medie (MCH)" },
                { "CHEM", "Concentratia medie a hemoglobinei eritrocitare (MCHC)" },
                { "RDW-CV", "Largimea distributiei eritrocitare - coeficient variatie (RDW)" },
                { "Nr. leucocite", "Numar de leucocite (WBC)" },
                { "Neutrofile", "Procentul de neutrofile (NEUT%)" },
                { "Nr. neutrofile", "Numar de neutrofile (NEUT)" },
                { "Eozinofile", "Procentul de eozinofile (EOS%)" },
                { "Nr. eozinofile", "Numar de eozinofile (EOS)" },
                { "Basofile", "Procentul de bazofile (BAS%)" },
                { "Nr. basofile", "Numar de bazofile (BAS)" },
                { "Limfocite", "Procentul de limfocite (LYM%)" },
                { "Nr. limfocite", "Numar de limfocite (LYM)" },
                { "Monocite", "Procentul de monocite (MON%)" },
                { "Nr. monocite", "Numar de monocite (MON)" },
                { "Nr. trombocite", "Numar de trombocite (PLT)" },
                { "VTM", "Volumul  mediu plachetar (MPV)" },
                { "PDW", "Distributia plachetelor(trombocitelor) (PDW)" },
            };

            if (reports == null)
            {
                throw new ArgumentException("Reports is null");
            }
           
            reports = reports
                .OrderBy(r => DateTime.ParseExact(r.ReportDate, "dd.MM.yyyy", System.Globalization.CultureInfo.InvariantCulture))
                .ToList();
          
            var testResults = new Dictionary<string, List<string>>();

            List<ChartModel> chartModel = new List<ChartModel>();

           
            foreach (var report in reports)
            {               
                NormalizeReportData(report, parameterMapping);
                foreach (var value in report.ExtractedData)
                {                  
                    var existingChartModel = chartModel.FirstOrDefault(c => c.Name == value.Test);                                       
                    if (existingChartModel == null)
                    {                       
                        List<string> rangeParts = new List<string>();
                        string max = "";
                        string min = "";
                        // If not, create a new ChartModel and add it to 
                        if (value.IntervalDeReferinta != null)
                        {
                           var range = System.Text.RegularExpressions.Regex.Split(value.IntervalDeReferinta, @"[^0-9.,<>]+");
                           rangeParts = range.Where(part => !string.IsNullOrWhiteSpace(part)).ToList();
                           
                            if( rangeParts.Count == 2)
                            {
                                min = rangeParts[0];
                                max = rangeParts[1];
                            }
                            else if(rangeParts.Count == 1)
                            {                               
                                var parts = Regex.Split(rangeParts[0], @"(?=[<>])|(?<=[<>])")
                                 .Where(part => !string.IsNullOrWhiteSpace(part))
                                 .ToArray();

                                if(rangeParts[0].Contains("<")) {
                                    max = parts[1];
                                }
                                if (rangeParts[0].Contains(">")) {
                                    min = parts[0];
                                }                             
                            }
                        }
                        var newChartModel = new ChartModel
                        {
                            Name = value.Test,
                            Values = new List<string>(),
                            Min = min,
                            Max = max,
                        };
                        newChartModel.Values.Add(value.Rezultat);
                        chartModel.Add(newChartModel);
                    }
                    else
                    {
                        existingChartModel.Values.Add(value.Rezultat);
                    }                                     
                }
            }         
            return chartModel;
        }
        static void NormalizeReportData(ExportDataModel exportData, Dictionary<string, string> mapping)
        {
            foreach (var data in exportData.ExtractedData)
            {
                // Update the ParameterName to the standardized version if found in the mapping
                if (mapping.ContainsKey(data.Test))
                {
                    data.Test = mapping[data.Test];
                }
            }
        }
    }
}