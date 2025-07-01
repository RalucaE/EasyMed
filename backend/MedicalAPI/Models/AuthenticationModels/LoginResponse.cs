using MedicalAPI.Models;

namespace MedicalAPI.Models.AuthenticationModels
{
    public class LoginResponse
    {
        public string Token { get; set; }
        public object User { get; set; }
    }
}
