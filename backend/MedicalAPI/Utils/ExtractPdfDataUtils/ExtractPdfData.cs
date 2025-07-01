using Newtonsoft.Json;
using System.Diagnostics;
using System.Text;

namespace MedicalAPI.Utils
{
    public class ExtractPdfData {
        public static (List<Dictionary<string, object>> tables, string date) RunPythonScript(string path)
        {
            var result = new Dictionary<string, object>();
            var tables = new List<Dictionary<string, object>>();
            string date = "";
            // Path to the Python interpreter
            string pythonPath = @"C:\Python312\python.exe";
            // Path to the Python script
            string scriptPath = @"C:/Users/CiangauRalucaElena/Desktop/MedicalAppGit/MedicalAppNew/backend/MedicalAPI/Utils/ExtractPdfDataUtils/extract.py";

        // Set up the process to start the Python script
        ProcessStartInfo psi = new ProcessStartInfo
            {
                FileName = pythonPath, // Python executable
                Arguments = $"{scriptPath} {path}", // Script and arguments
                RedirectStandardOutput = true, // Redirect standard output
                RedirectStandardError = true, // Redirect standard error
                StandardOutputEncoding = Encoding.UTF8,
                UseShellExecute = false, // Do not use shell execution
                CreateNoWindow = true,  // Do not create a command window
                
            };
           
            using (Process process = new Process())
            {
                process.StartInfo = psi;
                process.OutputDataReceived += (sender, args) =>
                {
                    if (!string.IsNullOrEmpty(args.Data))
                    {
                        Console.WriteLine(args);
                        result = JsonConvert.DeserializeObject<Dictionary<string, object>>(args.Data);
                        string table = result["tables"].ToString();
                       
                        tables = JsonConvert.DeserializeObject<List<Dictionary<string, object>>>(table);
                        date = result["date"].ToString();
                        var c = "";
                    }
                };
                process.ErrorDataReceived += (sender, args) =>
                {
                    if (!string.IsNullOrEmpty(args.Data))
                    {
                        Console.Error.WriteLine(args.Data);
                    }
                };

                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();
                process.WaitForExit();
            }          
            return (tables, date);
        }
    }
}