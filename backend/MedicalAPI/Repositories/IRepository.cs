using System.Linq.Expressions;

namespace MedicalAPI.Repositories
{
    public interface IRepository<T>
    {
        List<T> GetMany(Expression<Func<T, bool>>? expression = null);
        T? Get(int id);
        bool Create(T user);
        bool Update(T user);
        bool Delete(int id);
    }
}
