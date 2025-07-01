using MedicalAPI.Models;
using MedicalAPI.Models.Entities;
using System.Linq.Expressions;

namespace MedicalAPI.Repositories
{
    public class UserDetailsRepository : IRepository<UserDetails>
    {
        private readonly MedicalAppContext _appContext;
        public UserDetailsRepository(MedicalAppContext appContext)
        {
            _appContext = appContext;
        }

        bool IRepository<UserDetails>.Create(UserDetails userDetails)
        {
            try
            {
                UserDetails? existingUserDetails = _appContext.UsersDetails                 
                    .FirstOrDefault(u => u.UserId == userDetails.UserId);

                if (existingUserDetails != null)
                {
                    _appContext.UsersDetails.Remove(existingUserDetails);
                    _appContext.SaveChanges();
                }

                _appContext.UsersDetails.Add(userDetails);
                _appContext.SaveChanges();
               
              
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }
        public UserDetails? AddUserDetails(UserDetails userDetails)
        {
            try
            {
                UserDetails? newUserDetails = _appContext.UsersDetails.Add(userDetails).Entity;
                _appContext.SaveChanges();
                return newUserDetails;
            }
            catch (Exception e)
            {
                return null;
            }
        }

        bool IRepository<UserDetails>.Delete(int id)
        {
            throw new NotImplementedException();
        }

        UserDetails? IRepository<UserDetails>.Get(int id)
        {
            try
            {
                return _appContext.UsersDetails.Find(id);
            }
            catch
            {
                return null;
            }
        }

        List<UserDetails> IRepository<UserDetails>.GetMany(Expression<Func<UserDetails, bool>>? expression)
        {
            throw new NotImplementedException();
        }

        bool IRepository<UserDetails>.Update(UserDetails user)
        {
            throw new NotImplementedException();
        }
    }
}