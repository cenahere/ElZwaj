import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AlertifyService } from '../services/alertify.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService:AuthService,private alertifyService:AlertifyService,private rotuer:Router){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {


      const roles = next.firstChild.data['roles'] as Array<string>;
      if(roles){
        const match = this.authService.roleMatch(roles);
        if(match){
          return true;
        }
        else{
        this.rotuer.navigate(['members']);
        this.alertifyService.error('غير مسموح لك بالدخول');
        }
      }

    if(this.authService.loggedIn()){
      this.authService.HubConnection.stop();
      return true;
    }
    this.alertifyService.error('يجب تسجيل الدخول اولا');
    this.rotuer.navigate(['']);
    return false;
  }
}
