namespace MedicalAPI.Models.Entities
{
    public partial class UserDetails
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? Gender { get; set; }
        public int Age { get; set; }
        public double Weight { get; set; }
        public double Height { get; set; }
        public double WaistCircumference { get; set; }
        public string? ArterialTension { get; set; }
        public string? AlcoholConsumption { get; set; }
        public string? PhysicalActivityLevel { get; set; }
        public bool? Smoking { get; set; }
        public bool? Diabetes { get; set; }
        public bool? Hypertension { get; set; }
        public bool? AutoimmuneDiseases { get; set; }
        public string? Allergies { get; set; }
    }
}
