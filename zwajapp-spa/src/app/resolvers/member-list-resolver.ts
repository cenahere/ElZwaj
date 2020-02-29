import { Injectable } from "@angular/core";
import { Resolve, Router, ActivatedRouteSnapshot } from '@angular/router';
import { User } from '../models/user';
import { UserService } from '../services/user.service';
import { AlertifyService } from '../services/alertify.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class MemberListResolver implements Resolve<User[]>{
    pageNumber=1;
    pageSize=10;

    constructor(private userService:UserService , private router:Router , private alertifyService:AlertifyService) {} 
        resolve(route:ActivatedRouteSnapshot):Observable<User[]>{
            return this.userService.getUsers(this.pageNumber,this.pageSize).pipe(
                catchError(error=>{
                    this.alertifyService.error('يوجد مشكله في عرض البيانات');
                    this.router.navigate(['']);
                    return of(null);
                })
            )

    }
}