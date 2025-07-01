import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatMenu } from '@angular/material/menu';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @ViewChild('menu') menu!: MatMenu;
  isClicked = false;
  isAuthenticated: boolean = false;
  role: string | null = "User";
  isAdmin: boolean = false;
  username: string | null = " ";
  menuOpen = false;
  constructor(
    private elementRef: ElementRef,  
    private authService: AuthService,
    private router: Router
    ) {}

  handleClick() {
    this.isClicked = true;
  }
  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: any) {
    const isClickedOutside = !this.elementRef.nativeElement.contains(targetElement);
    if (isClickedOutside) {
      this.isClicked = false;
    }
  }
  ngOnInit(): void {   
    this.isAuthenticated = this.authService.isAuthenticated();
    this.role = this.authService.getRole();
    if(this.isAuthenticated == true) { 
      this.username = this.authService.getUserName();
    }
    if(this.isAuthenticated == true && this.role=="Admin") {
      this.isAdmin = true;  
    } 
  }
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  keyword: string | null = '';
  logout() {
    this.authService.logout();
    window.location.href="/login";
  }
  redirectTo(uri: string, keyword:string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([uri, keyword])});
  }
}