import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'medical-app';
  token: string | null = "";
  showHeader: boolean = true;
  
  constructor(private authService: AuthService, private router: Router) {
    this.router.events.subscribe(() => {
      // List of routes that should NOT have the header
      const routesWithoutHeader = ['/login', '/register'];

      // Check the current route
      this.showHeader = !routesWithoutHeader.includes(this.router.url);
    });
  }

  ngOnInit(): void { 
    this.token = localStorage.getItem('token');
    if (this.token) {
        var exp = this.authService.getTokenExpirationTimeInSeconds(this.token);
    } else {
        console.log("Token not found in localStorage");
    }
  }
}
