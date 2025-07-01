using MedicalAPI.Models.AuthenticationModels;
using MedicalAPI.Models.Entities;
using MedicalAPI.Repositories;
using MedicalAPI.Repositories.UsersRepository;
using MedicalAPI.Utils;

namespace MedicalAPI.Services
{
    public class UsersService
    {
        private readonly IUsersRepository _usersRepository;
        private readonly IRepository<UserDetails> _usersDetailsRepository;
        private readonly IRepository<Role> _rolesRepository;
        private readonly IConfiguration _configuration;
        public UsersService(
            IUsersRepository usersRepository,
            IRepository<UserDetails> usersDetailsRepository,
            IRepository<Role> rolesRepository,
            IConfiguration configuration
        )
        {
            _usersRepository = usersRepository;
            _usersDetailsRepository = usersDetailsRepository;
            _rolesRepository = rolesRepository;
            _configuration = configuration;
        }
        public bool Register(RegisterRequest registerRequest)
        {
            // Check if user already exists          
            var existingUser = _usersRepository.GetByEmail(registerRequest.Email);
            if (existingUser != null)
                return false;

            var role = _rolesRepository.Get((int)RolesEnum.user);

            // Create new User object
            var user = new User
            {
                FullName = registerRequest.FullName,
                Username = registerRequest.Username,
                Email = registerRequest.Email,
                Password = registerRequest.Password,
                Role = role!,
                UserDetails = null,
            };
            // Save user using the Create method in UsersRepository
            return _usersRepository.Create(user);
        }
        public LoginResponse? Login(LoginRequest loginRequest)
        {
            LoginResponse response = new LoginResponse();

            var user = _usersRepository.GetByEmail(loginRequest.Email);

            if (user == null || user.Password != loginRequest.Password)
            {
                return null;
            }

            if (user.Role != null)
            {
                response.Token = JwtUtils.GenerateJwtToken(_configuration, user, user.Role.Name);
                response.User = user.toJson();
            }
            return response;
        }
        public bool AddUserDetails(int userId, UserDetails userDetails)
        {
            var user = _usersRepository.Get(userId);
            if (user == null)
                return false;

            userDetails.UserId = user.Id;
            _usersDetailsRepository.Create(userDetails);
            user.UserDetails = userDetails;
            _usersRepository.Update(user);
            return true;
        }
        public bool EditUser(User user)
        {
            var existingUser = _usersRepository.Get(user.Id);
            if (existingUser == null)
                return false;

            if(user.UserDetails != null)
            {
                UserDetails userDetails = user.UserDetails;
                userDetails.UserId = user.Id;

                _usersDetailsRepository.Create(userDetails);             
            }        
            _usersRepository.Update(user);
            return true;
        }
    }
}
