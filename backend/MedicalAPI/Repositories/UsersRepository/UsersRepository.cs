using MedicalAPI.Models;
using MedicalAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace MedicalAPI.Repositories.UsersRepository
{
    public class UsersRepository : IUsersRepository
    {
        private readonly MedicalAppContext _appContext;
        public UsersRepository(MedicalAppContext appContext)
        {
            _appContext = appContext;
        }

        bool IRepository<User>.Create(User user)
        {
            try
            {
                _appContext.Users.Add(user);
                _appContext.SaveChanges();
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        bool IRepository<User>.Delete(int id)
        {
            try
            {
                // Get existing user
                User? existingUser = _appContext.Users
                    .Include(u => u.Role)
                    .FirstOrDefault(u => u.Id == id);

                if (existingUser == null)
                    return false;

                _appContext.Users.Remove(existingUser);
                _appContext.SaveChanges();
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        User? IRepository<User>.Get(int id)
        {
            try
            {
                return _appContext.Users
                    .Include(u => u.Role)
                    .Include(u => u.UserDetails)
                    .FirstOrDefault(u => u.Id == id);
            }
            catch
            {
                return null;
            }
        }

        List<User> IRepository<User>.GetMany(Expression<Func<User, bool>>? expression)
        {
            try
            {
                if (expression != null)
                {
                    return _appContext.Users
                        .Include(u => u.Role)
                        .Where(expression)
                        .ToList();
                }
                else
                {
                    return _appContext.Users
                        .Include(u => u.Role)
                        .ToList();
                }
            }
            catch
            {
                return new List<User>();
            }
        }

        bool IRepository<User>.Update(User user)
        {
            try
            {
                var existingUser = _appContext.Users.Find(user.Id);
                if (existingUser == null)
                {
                    Console.Error.WriteLine($"User with ID {user.Id} not found.");
                    return false;
                }
               
                user.RoleId = existingUser.RoleId;
                user.Email = existingUser.Email;
                user.Password = existingUser.Password;
                var roleExists = _appContext.Roles.Any(r => r.Id == user.RoleId);
                if (!roleExists)
                {
                    Console.Error.WriteLine($"Role with ID {user.RoleId} does not exist.");
                    return false;
                }
               
                _appContext.Entry(existingUser).CurrentValues.SetValues(user);
                _appContext.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                return false;
            }
        }
        User? IUsersRepository.GetByEmail(string email)
        {
            try
            {
                return _appContext.Users
                     .Include(u => u.Role)
                     .Include(u => u.UserDetails)
                     .FirstOrDefault(u => u.Email.Equals(email));
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}