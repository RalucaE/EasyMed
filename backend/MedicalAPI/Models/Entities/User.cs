namespace MedicalAPI.Models.Entities;

public partial class User
{
    public int Id { get; set; }

    public string FullName { get; set; } = null!;

    public string Username { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public int RoleId { get; set; }

    public virtual ICollection<Report> Reports { get; set; } = new List<Report>();

    public virtual Role Role { get; set; } = null!;
    public virtual UserDetails? UserDetails { get; set; } = null!;

    public object toJson()
    {
        return new
        {
            Id,
            FullName,
            Username,
            Email,
            Password,
            RoleName = Role.Name,
            Reports,
            UserDetails
        };
    }
}
