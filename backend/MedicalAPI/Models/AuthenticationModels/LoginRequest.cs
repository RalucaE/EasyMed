using System.ComponentModel.DataAnnotations;

namespace MedicalAPI.Models.AuthenticationModels
{
    public class LoginRequest
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
