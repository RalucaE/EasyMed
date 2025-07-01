import { Injectable } from '@angular/core';
import { ApiService } from './http/api.service';
import { User } from '../entities/User';
import { Observable } from 'rxjs';
import { RegisterRequest } from '../models/RegisterRequest';
import { LoginRequest } from '../models/LoginRequest';
import { LoginResponse } from '../models/LoginResponse';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private jwtHelper: JwtHelperService,
    private router: Router
  ) {}

  getUsers(): Observable<User[]>{
    return this.apiService.get(['users']);  
  }
  getUser(id: number): Observable<User>{
    return this.apiService.get([`getUser/${id}`]);
  }
  editUser(user: User): Observable<any> {
    return this.apiService.put(['editUser'], user);
  }
  register(registerRequest: RegisterRequest): Observable<any> {
    return this.apiService.post(['register'], registerRequest);
  }
  login(loginRequest: LoginRequest): Observable<LoginResponse> { 
    return this.apiService.post(['login'], loginRequest);
  } 
  getToken(): string | null{
    return localStorage.getItem('token');
  }
  getRole(): string | null{
    return localStorage.getItem('role');
  }
  getUserName(): string | null{
    return localStorage.getItem('username');
  }
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (token == null) {
      return false; 
    }
    if(this.jwtHelper.isTokenExpired(token)) {
      console.log("Token expirat");
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      return false;
    } 
    return true;
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
  getTokenExpirationTimeInSeconds(token: string): number | null {
    const decodedToken = this.jwtHelper.decodeToken(token);
    var claims = decodedToken.claims;
    if (decodedToken.exp === undefined) {        
      return null;
    }
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);   
    const timeUntilExpirationInSeconds = decodedToken.exp - currentTimeInSeconds;
    return timeUntilExpirationInSeconds;
  }
  getCurrentUser(): any {
    return this.userSubject.value;
  }
}