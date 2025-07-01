using MedicalAPI.Models;
using MedicalAPI.Models.AuthenticationModels;
using MedicalAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using MedicalAPI.Utils;
using MedicalAPI.Models.ProcessReportModels;
using MedicalAPI.Models.ElasticSearchModels;
using MedicalAPI.Repositories.UsersRepository;
using MedicalAPI.Models.Entities;
using MedicalAPI.Repositories.ReportsRepository;

namespace MedicalAPI.Controllers
{
    public class AppController : Controller
    {
        private readonly IUsersRepository _usersRepository;
        private readonly IReportsRepository<Report> _reportsRepository;
        private readonly UsersService _usersService;
        private readonly PatientsService _patientsService;
        private readonly ElasticSearchService _elasticSearchService;
        public AppController(
            IUsersRepository usersRepository,
            IReportsRepository<Report> reportsRepository,
            UsersService usersService,            
            PatientsService patientsService,
            ElasticSearchService elasticSearchService
        )
        {
            _usersRepository = usersRepository;
            _usersService = usersService;
            _reportsRepository = reportsRepository;
            _patientsService = patientsService;
            _elasticSearchService = elasticSearchService;
        }

        #region Authentication
        [HttpGet("/users")]
        public IActionResult GetUsers()
        {
            var users = _usersRepository.GetMany();
            if (users != null)
            {
                var usersJson = users.Select(user => user.toJson()).ToList();
                return Ok(usersJson);
            }
            else
            {
                return NotFound();
            }
        }
        [HttpGet("/getUser/{id}")]
        public IActionResult GetUser(int id)
        {
            var user = _usersRepository.Get(id);
            if (user != null)
                return Ok(user);
            else
                return NotFound();

        }
        [HttpPost("/register")]
        public IActionResult Register([FromBody] RegisterRequest registerRequest)
        {
            var succes = _usersService.Register(registerRequest);
            if (!succes)
                return BadRequest(new { message = "Something went wrong" });
            else
                return Ok(new { message = "User registered" });
        }
        [HttpPost("/login")]
        public IActionResult Login([FromBody] LoginRequest loginRequest)
        {
            var loginResponse = _usersService.Login(loginRequest);
            if (loginResponse?.Token == null)
            {
                return BadRequest(loginResponse);
            }
            return Ok(loginResponse);
        }
        [HttpPut("/editUser")]
        public IActionResult EditUser([FromBody] User user)
        {
            if (user == null)
            {
                return BadRequest(new { message = "Invalid user data received" });
            }
            var succes = _usersService.EditUser(user);
            if (!succes)
                return BadRequest(new { message = "Something went wrong" });
            else
                return Ok(new { message = "User edited" });
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("/deleteUser/{id}")]
        public IActionResult DeleteUser(int id)
        {
            var succes = _usersRepository.Delete(id);
            if (!succes)
                return BadRequest(new { message = "Something went wrong" });
            else
                return Ok(new { message = "User deleted" });
        }

        #endregion

        [HttpPost("/addReport")]
        public async Task<IActionResult> AddReport([FromForm] string report, [FromForm] IFormFile file)
        {
            if (report == null || file == null)
            {
                return BadRequest(new { message = "Report data or file is missing" });
            }
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "assets", "reports", file.FileName);
            if (string.IsNullOrEmpty(filePath))
            {
                return BadRequest(new { message = "Failed to save the file" });
            }
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }
            try
            {
                var result = ExtractPdfData.RunPythonScript(filePath);
                var date = result.date;
                // Save extracted data to in ElasticSearch
                var documentId = Guid.NewGuid().ToString();
                //Prepare the document to index in Elasticsearch
                var document = new
                {
                    Id = documentId,
                    ExtractedData = result.tables,
                    ReportDate = date
                };
                // Index the document in Elasticsearch
                if (_elasticSearchService.Client == null)
                {
                    throw new InvalidOperationException("Elasticsearch client is not initialized.");
                }
                var indexResponse = _elasticSearchService.Client.Index(document, i => i
                    .Index("pdf_data")  // Use the default index or specify another one
                    .Id(documentId)    // Explicitly set the document ID
                );
                if (!indexResponse.IsValid)
                {
                    return StatusCode(500, "Failed to index document in Elasticsearch: " + indexResponse.ServerError.Error.Reason);
                }
                //Add report to database                           
                var reportObject = JsonConvert.DeserializeObject<Report>(report);
                reportObject.ReportDate = date;
                reportObject.FilePath = filePath;
                reportObject.ReportId = documentId;
                var succes = _reportsRepository.Create(reportObject);
                if (!succes)
                    return BadRequest(new { message = "Something went wrong" });
                else
                {
                    return Ok(reportObject);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }
        [HttpGet("/reports")]
        public IActionResult GetReports()
        {
            var reports = _reportsRepository.GetMany();
            if (reports != null )
            {         
                return Ok(reports.ToList());
            }
            else
            {
                return NotFound();
            }
        }
        [HttpGet("/getReport/{id}")]
        public IActionResult GetReport(int id)
        {
            var report = _reportsRepository.Get(id);
            if (report != null)
                return Ok(report);
            else
                return NotFound();

        }
        [HttpDelete("/deleteReport/{id}")]
        public IActionResult DeleteReport(int id)
        {
            //Get report id
            var report = _reportsRepository.Get(id);
            if (report == null)
            {
                return NotFound(new { message = "Report not found" });
            }

           //Delete document from elastic search
            //Get document Id
            var documentId = report.ReportId;
            //Check if document exists
            var document = _elasticSearchService.Client.Get<object>(documentId, g => g.Index("pdf_data"));
            if (!document.Found)
            {
                //return NotFound(new { message = "Document not found" });
                throw new InvalidOperationException($"Document with ID '{documentId}' not found.");
            }
            //Delete document
            var deleteDocument = _elasticSearchService.Client.Delete<object>(documentId, d => d.Index("pdf_data"));
            if (!deleteDocument.IsValid)
            {
                return StatusCode(500, "Failed to delete document from Elasticsearch: " + deleteDocument.ServerError.Error.Reason);
            }
           //Delete pdf from the project
            if (!string.IsNullOrEmpty(report.FilePath) && System.IO.File.Exists(report.FilePath))
            {
                System.IO.File.Delete(report.FilePath);
            }
           //Delete report from SQL database
            var deleteReport = _reportsRepository.Delete(id);
            if (!deleteReport)
                return BadRequest(new { message = "Something went wrong" });
            else
                return Ok(new { message = "Report deleted" });
        }
     
        [HttpGet("/getReportsByUserId/{id}")]
        public IActionResult GetReportsByUserId(int id)
        {
            var reports = _reportsRepository.GetReportsByUserId(id);
            if (reports != null)
            {
                return Ok(reports.ToList());
            }
            else
            {
                return NotFound();
            }
        }
        [Authorize]
        [HttpGet("/getReportData/{documentId}")]
        public IActionResult getDataFromElastic(string documentId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(documentId))
                {
                    return BadRequest(new { Message = "Document ID is required." });
                }

                // Retrieve the document from Elasticsearch
                var response = _elasticSearchService.Client.Get<object>(documentId, g => g.Index("pdf_data"));

                if (!response.Found)
                {
                    return NotFound(new { Message = "Document not found", DocumentId = documentId });
                }                          
                // Return the document data
                return Ok(new
                {
                    Data = response.Source
                });
            }
            catch (Exception ex)
            {
                // Handle any errors
                return StatusCode(500, new { Message = "An error occurred while retrieving the document", Error = ex.Message });
            }
        }        
        [HttpPost("/compareReports")]
        public IActionResult compareReports([FromBody] List<ElasticPdfModel> documentIds)
        {

            if (documentIds == null || documentIds.Count < 2)
            {
                throw new ArgumentException("At least two documents are required for comparison.");
            }
            var documentsData = new List<ExportDataModel>();
            var dates = new List<string>();

            foreach (var documentId in documentIds)
            {
                var response = _elasticSearchService.Client.Get<object>(
                documentId.id,
                g => g.Index("pdf_data")
                );

                if (!response.IsValid)
                {
                    throw new Exception($"Failed to retrieve document with id: {documentId.id}");
                }
                var reportData = _elasticSearchService.Client.Get<object>(documentId.id, g => g.Index("pdf_data"));
                var report = JsonConvert.DeserializeObject<ExportDataModel>(JsonConvert.SerializeObject(reportData.Source));
                dates.Add(report.ReportDate);
                documentsData.Add(report);
            }

            var res = _patientsService.CompareReports(documentsData);
            var result = new List<object>
            {
                new { Data = res },
                new { ReportDate = dates },
            };

            return Ok(result);
        }

        [HttpPost("/addUserDetails/{userId}")]
        public IActionResult AddUserDetails(int userId, [FromBody] UserDetails userDetails)
        {
            bool success = _usersService.AddUserDetails(userId, userDetails);
            if (success)
                return Ok("UserDetails added successfully.");
            else
                return NotFound("User not found.");
        }
    }
}