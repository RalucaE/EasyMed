using MedicalAPI.Models.Entities;

namespace MedicalAPI.Repositories.UsersRepository
{
    public interface IUsersRepository : IRepository<User>
    {
        User? GetByEmail(string email);
    }
}
