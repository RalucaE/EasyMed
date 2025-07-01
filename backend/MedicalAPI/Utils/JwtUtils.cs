using MedicalAPI.Models.Entities;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MedicalAPI.Utils
{
    public class JwtUtils
    {
        public static string GenerateJwtToken(IConfiguration configuration, User user, string role)
        {
            var claims = new[]
            {
                new Claim("email", user.Email),
                new Claim("role", role)
            };

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
              configuration["Jwt:Issuer"],
              configuration["Jwt:Audience"],
              claims: claims,
              expires: DateTime.Now.AddMinutes(30),
              signingCredentials: credentials);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}