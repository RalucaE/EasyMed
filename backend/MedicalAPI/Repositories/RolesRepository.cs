using MedicalAPI.Models;
using MedicalAPI.Models.Entities;
using System.Linq.Expressions;

namespace MedicalAPI.Repositories
{
    public class RolesRepository : IRepository<Role>
    {
        private readonly MedicalAppContext _appContext;
        public RolesRepository(MedicalAppContext appContext)
        {
            _appContext = appContext;
        }

        bool IRepository<Role>.Create(Role user)
        {
            throw new NotImplementedException();
        }

        bool IRepository<Role>.Delete(int id)
        {
            throw new NotImplementedException();
        }

        Role? IRepository<Role>.Get(int id)
        {
            try
            {
                return _appContext.Roles.Find(id);
            }
            catch
            {
                return null;
            }
        }

        List<Role> IRepository<Role>.GetMany(Expression<Func<Role, bool>>? expression)
        {
            throw new NotImplementedException();
        }

        bool IRepository<Role>.Update(Role user)
        {
            throw new NotImplementedException();
        }
    }
}