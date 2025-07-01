using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace MedicalAPI.Models.Entities;

public partial class Report
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string ReportId { get; set; } = null!;

    public int UserId { get; set; }

    public string Description { get; set; } = null!;

    public string ReportDate { get; set; } = null!;

    public string UploadDate { get; set; } = null!;

    public string? FilePath { get; set; }

    [JsonIgnore]
    public virtual User User { get; set; } = null!;
}
