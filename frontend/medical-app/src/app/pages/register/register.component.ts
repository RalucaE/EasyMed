import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/RegisterRequest';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  private validatePassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      this.errorMessage = 'Parola trebuie să aibă minim 8 caractere';
      return false;
    }
    if (!hasUpperCase) {
      this.errorMessage = 'Parola trebuie să conțină cel puțin o literă mare';
      return false;
    }
    if (!hasLowerCase) {
      this.errorMessage = 'Parola trebuie să conțină cel puțin o literă mică';
      return false;
    }
    if (!hasNumbers) {
      this.errorMessage = 'Parola trebuie să conțină cel puțin o cifră';
      return false;
    }
    if (!hasSpecialChar) {
      this.errorMessage = 'Parola trebuie să conțină cel puțin un simbol special (!@#$%^&*(),.?":{}|<>)';
      return false;
    }
    return true;
  }

  register(form: NgForm) {
    this.errorMessage = '';
    const registerRequest: RegisterRequest = form.value;

    if (!registerRequest.username || !registerRequest.email || !registerRequest.password) {
      this.errorMessage = 'Toate câmpurile trebuie completate';
      return;
    }
    if(!this.validatePassword(registerRequest.password)){
      return;
    }
    if (registerRequest.password !== form.value.confirmPassword) {
      this.errorMessage = 'Parolele nu coincid';
      return;
    }

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        console.log("User registered successfully");
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'A apărut o eroare la înregistrare';
        console.error('Registration error:', error);
      }
    });
  }
}