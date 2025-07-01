import { Injectable } from '@angular/core';
import { ApiService } from './http/api.service';
import { Observable } from 'rxjs';
import { Report } from '../entities/Report';
import { ElasticPdfModel } from '../models/ElasticPdfModel';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor(private apiService: ApiService) { }

  getReports(): Observable<Report[]>{
    return this.apiService.get(['reports']);  
  }
  getReport(id: number): Observable<Report>{
    return this.apiService.get([`getReport/${id}`]);
  }
  addReport(formData: FormData): Observable<any>{
    console.log(formData)
    return this.apiService.post(['addReport'], formData);
  }
  deleteReport(id: number): Observable<any>{
    return this.apiService.delete([`deleteReport/${id}`]);
  }
  extractTables(filePath: string | null): Observable<any> {
    const body = { filePath };
    return this.apiService.post(['extractTables'], body);
  }
  getReportData(documentId: string | null): Observable<any> {
    return this.apiService.get([`getReportData/${documentId}`]);
  }
  getReportsByUserId(id: number | null): Observable<any> {
    return this.apiService.get([`getReportsByUserId/${id}`]);
  }
  compareReports(documentIds: ElasticPdfModel[]):  Observable<any> {
    return this.apiService.post(['compareReports'], documentIds);
  }
}