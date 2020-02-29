import { Injectable } from "@angular/core";
import { Router, ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { AlertifyService } from '../services/alertify.service';


@Injectable()
export class MemeberEditResolver implements Resolve<User> {
    constructor(private authService:AuthService, private userService: UserService, private router:Router , private alertify:AlertifyService){}
    resolve(route:ActivatedRouteSnapshot):Observable<User>{
        return this.userService.getUser(this.authService.decodedToken.nameid).pipe(
            catchError(error =>{
                this.alertify.error('يوجد مشكلة في عرض البيانات');
                this.router.navigate(['/members']);
                return of(null);
            })
        )
    }
}