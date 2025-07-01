using System.ComponentModel.DataAnnotations;

namespace MedicalAPI.Models.AuthenticationModels
{
    public class RegisterRequest
    {
        [Required]
        public string FullName { get; set; }
        [Required]
        public string Username { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
