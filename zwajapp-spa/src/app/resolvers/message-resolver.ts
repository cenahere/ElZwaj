import { Injectable } from "@angular/core";
import { Resolve, Router, ActivatedRouteSnapshot } from "@angular/router";

import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { Message } from '../models/message';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { AlertifyService } from '../services/alertify.service';


@Injectable()
export class MessageResolver implements Resolve<Message[]>{
    pageNumber = 1;
    pageSize = 6;
    messageType='Unread';
    constructor(private authService:AuthService, private userService: UserService, private router: Router, private alertify: AlertifyService) { }
    resolve(route: ActivatedRouteSnapshot): Observable<Message[]> {
        return this.userService.getMessages(this.authService.decodedToken.nameid, this.pageNumber, this.pageSize,this.messageType).pipe(
            catchError(error => {
                this.alertify.error('يوجد مشكلة في عرض الرسائل');
                this.router.navigate(['']);
                return of(null);

            })
        )
    }
}
