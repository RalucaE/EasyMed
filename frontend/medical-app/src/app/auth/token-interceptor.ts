import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { AuthService } from "../services/auth.service";
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from "@angular/router";
@Injectable()
export class TokenInterceptor implements HttpInterceptor{
    constructor(
        private authService: AuthService, 
        private jwtHelper: JwtHelperService, 
        private router: Router
    ) {}
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if(this.jwtHelper.isTokenExpired(this.authService.getToken())  && this.authService.isAuthenticated())
        {
            window.alert("Your session has expired. You will be redirected to the login page.");
                this.authService.logout(); 
                this.router.navigateByUrl("/login");
        }
        if(this.authService.isAuthenticated())
        { 
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${this.authService.getToken()}`
                }
            });          
        }    
        return next.handle(request).pipe( tap(() => {},
        (err: any) => {
            if(err instanceof HttpErrorResponse) {
                if (err.status !== 401){
                    return;
                }
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('username');
                localStorage.removeItem('uderId');
                this.router.navigate(['/login']);               
            }
        }));
    }
    redirectTo(uri: string) {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate([uri])
        });
    }
}