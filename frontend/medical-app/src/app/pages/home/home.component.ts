import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  navigateToReports() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/reports']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  navigateToCharts() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/charts']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  navigateToScores() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/scores']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}