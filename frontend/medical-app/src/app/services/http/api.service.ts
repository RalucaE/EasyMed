import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }
  private apiBase = `https://localhost:44330/`;

  get(url: Array<string | number>): Observable<any> { 
    return this.http.get(this.apiBase + url);
  }
  post(url: Array<string | number>, bodyParams: any): Observable<any> {
    return this.http.post(this.apiBase + url, bodyParams);
  }
  put(url: Array<string | number>, bodyParams: any): Observable<any> {
    return this.http.put(this.apiBase + url, bodyParams);
  }
  delete(url: Array<string | number>): Observable<any>  {
  return this.http.delete(this.apiBase + url);
  }
}