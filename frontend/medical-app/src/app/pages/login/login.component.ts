import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LoginRequest } from 'src/app/models/LoginRequest';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(newForm: NgForm) {
    this.errorMessage = ''; // Reset error message on new login attempt
    let loginRequest: LoginRequest = newForm.value;

    if (!loginRequest.email || !loginRequest.password) {
      this.errorMessage = 'Toate câmpurile trebuie completate';
      return;
    }

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        console.log("User is logged in");
        localStorage.setItem('userId', response.user.id.toString());    
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.user.roleName);
        localStorage.setItem('username', response.user.username);    
        window.location.href="/home";          
      },
      error: (error) => {
        this.errorMessage = 'Adresa de email sau parola nu sunt corecte';
        console.error('Login error:', error);
      }
    }); 
  }
}