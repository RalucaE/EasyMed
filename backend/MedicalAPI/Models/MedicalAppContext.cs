using MedicalAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace MedicalAPI.Models;

public partial class MedicalAppContext : DbContext
{
    public MedicalAppContext(DbContextOptions<MedicalAppContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Report> Reports { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<UserDetails> UsersDetails { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Report>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Report__3213E83FD5FC457A");

            entity.ToTable("Report");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Description)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("description");
            entity.Property(e => e.FilePath)
                .HasMaxLength(200)
                .IsUnicode(false)
                .HasColumnName("filePath");
            entity.Property(e => e.ReportDate)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("reportDate");
            entity.Property(e => e.ReportId)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("reportId");
            entity.Property(e => e.Title)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("title");
            entity.Property(e => e.UploadDate)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("uploadDate");
            entity.Property(e => e.UserId).HasColumnName("userId");

            entity.HasOne(d => d.User).WithMany(p => p.Reports)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Report__userId__2A4B4B5E");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Roles__3213E83FE469036F");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("name");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3213E83FBC9B9683");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Email)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("fullName");
            entity.Property(e => e.Password)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("password");
            entity.Property(e => e.RoleId)
                .HasDefaultValue(2)
                .HasColumnName("roleId");          
            entity.Property(e => e.Username)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("username");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Users__roleId__276EDEB3");
            entity
               .HasOne(ud => ud.UserDetails)
               .WithOne()
               .HasForeignKey<UserDetails>(u => u.UserId)
               .IsRequired(false)
               .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserDetails>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__UserDeta__3213E83F0D9E1593");

            entity.ToTable("UserDetails");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId)
                .IsUnicode(false)
                .HasColumnName("userId");
            entity.Property(e => e.Age)
                .IsUnicode(false)
                .HasColumnName("age");
            entity.Property(e => e.Weight)
                .IsUnicode(false)
                .HasColumnName("weight");
            entity.Property(e => e.Height)
                .IsUnicode(false)
                .HasColumnName("height");
            entity.Property(e => e.Gender)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("gender");
            entity.Property(e => e.WaistCircumference)
                .IsUnicode(false)
                .HasColumnName("waistCircumference");
            entity.Property(e => e.ArterialTension)
               .HasMaxLength(3)
               .IsUnicode(false)
               .HasColumnName("arterialTension");
            entity.Property(e => e.AlcoholConsumption)
               .HasMaxLength(50)
               .IsUnicode(false)
               .HasColumnName("alcoholConsumption");
            entity.Property(e => e.PhysicalActivityLevel)
              .HasMaxLength(50)
              .IsUnicode(false)
              .HasColumnName("physicalActivityLevel");
            entity.Property(e => e.Smoking)
               .IsUnicode(false)
               .HasColumnName("smoking");
            entity.Property(e => e.Diabetes)
               .IsUnicode(false)
               .HasColumnName("diabetes");
            entity.Property(e => e.Hypertension)
               .IsUnicode(false)
               .HasColumnName("hypertension");
            entity.Property(e => e.AutoimmuneDiseases)
               .IsUnicode(false)
               .HasColumnName("autoimmuneDiseases");
            entity.Property(e => e.Allergies)
               .HasMaxLength(50)
               .IsUnicode(false)
               .HasColumnName("allergies");
        });
        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}