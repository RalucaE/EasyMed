using System.Linq.Expressions;

namespace MedicalAPI.Repositories.ReportsRepository
{
    public interface IReportsRepository<T>
    {
        List<T> GetMany(Expression<Func<T, bool>>? expression = null);
        List<T> GetReportsByUserId(int id);
        T? Get(int id);
        bool Create(T user);
        bool Update(T user);
        bool Delete(int id);
    }
}