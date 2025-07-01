import { Component, ViewEncapsulation } from '@angular/core';
import { ReportsService } from 'src/app/services/reports.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReportComponent {
  isLoading: boolean = false;
  extractedData: any = null; 
  documnetId!: string | null;
  
  constructor(
    private reportService: ReportsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit(): void { 
    this.documnetId = this.route.snapshot.queryParamMap.get('id');
    this.getReportData(this.documnetId);
  }
  getReportData(documnetId: string | null) {
    this.isLoading = true;
    this.reportService.getReportData(documnetId).subscribe((response => {
      this.extractedData = response.data.extractedData;
      if(this.extractedData) {    
        this.isLoading = false;  
        this.generateTable(this.extractedData);     
      }
    }));
  }
  generateTable(data: any) {
    const headers = Object.keys(data[0]);
    // Create the table element
    const table = document.createElement('table');
    // Create the table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    // Create the table body
    const tbody = document.createElement('tbody');
    data.forEach((row: { [x: string]: string | null; }) => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header] !== null ? row[header] : ''; // Replace null with empty string
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    // Append the generated table to the container
    const tableContainer = document.getElementById('table-container');
    tableContainer!.appendChild(table);
  }
  goToScores(){
    this.router.navigate(['/scores'], { queryParams: { id: this.documnetId}})
  }
}