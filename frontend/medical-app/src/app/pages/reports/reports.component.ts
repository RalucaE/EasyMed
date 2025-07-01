import { Component } from '@angular/core';
import { Report } from 'src/app/entities/Report';
import { ReportsService } from 'src/app/services/reports.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {
  selectedFile: File | null = null;
  userId = localStorage.getItem('userId')!;
  newReport: Report = new Report();
  userReports: any[] = [];
  isLoading: boolean = false;
  isLoading2: boolean = false;
  isPdfLoaded: boolean = false;
  isReportLoaded: boolean = false;
  fileName!: string;
  isUploadPopupOpen: boolean = false;

  constructor(
    private reportService: ReportsService,
    private sanitizer: DomSanitizer,
    private router: Router
  ){}
 
  ngOnInit(): void {
    if(this.userId) {
      this.reportsByUserId(parseInt(this.userId));
    }   
  }
  openUploadPopup() {
    this.isUploadPopupOpen = true;
  }
  closeUploadPopup(event: Event) {
    event.preventDefault();
    this.isUploadPopupOpen = false;
    // Reset form state
    this.selectedFile = null;
    this.isPdfLoaded = false;
    this.isReportLoaded = false;
    this.isLoading2 = false;
  }
  onSubmit() {
    this.isLoading2 = true;
    this.isReportLoaded = false;
    const formData = new FormData();
    //Get current date
    const currentDate = new Date();
    const currentformattedDate = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear()}`;
    // Create the Report object and add other properties 
    this.newReport.title = this.selectedFile!.name;
    this.newReport.reportId = "";
    this.newReport.userId = parseInt(this.userId!);
    this.newReport.description = "This is a sample report";
    this.newReport.uploadDate = currentformattedDate;
    // Add the serialized Report object (as JSON string) to the FormData
    formData.append('report', JSON.stringify(this.newReport));
    // Append the file
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }
    // Send the form data to the backend
    this.reportService.addReport(formData).subscribe((resp) => {
      this.isReportLoaded = true;
      this.isLoading2 = false;
      setTimeout(() => {
        this.closeUploadPopup(new Event('submit'));
        window.location.reload();
      }, 2000);
    });
  }
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
      console.log(this.fileName)
      if (this.selectedFile.type === 'application/pdf') {
        this.isPdfLoaded = true;
      } 
      else {
        this.isPdfLoaded = false;
        alert('Please upload a valid PDF file.');
      }
    }
  }
  reportsByUserId(id: number) {
    this.isLoading = true;
    this.reportService.getReportsByUserId(id).subscribe({
      next: (reports) => {
        this.userReports = reports.map((report: { filePath: string; }) => ({
          ...report,
          filePath: this.sanitizer.bypassSecurityTrustResourceUrl(report.filePath), // Sanitize the URL   
        }));     
       this.isLoading = false;   
      }  
    });
  }
  deleteReport(id: number) {
    this.reportService.deleteReport(id).subscribe((() => {
      window.location.reload();
    }));
  }
  openReport(documentId: string) {
    this.router.navigate(['/report'], { queryParams: { id: (documentId)}});   
  }
}