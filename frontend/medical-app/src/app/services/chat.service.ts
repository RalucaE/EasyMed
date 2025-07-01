import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpBackend } from '@angular/common/http';
import { environment } from '../../environment'

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = environment.API_URL;
  private apiKey = environment.API_KEY;
  private httpClient: HttpClient;

  constructor(private http: HttpClient, private httpBackend: HttpBackend) {
    this.httpClient = new HttpClient(httpBackend);
  }

  sendMessage(message: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });
    const body = {
      "model": "meta-llama/llama-4-scout-17b-16e-instruct",
      "messages": [{
          "role": "user",
          "content": message
      }]
    }
    return this.httpClient.post(this.apiUrl, body, { headers });
  }
}