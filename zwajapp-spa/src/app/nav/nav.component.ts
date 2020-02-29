import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AlertifyService } from '../services/alertify.service';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { UserService } from '../services/user.service';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model:any={}
  photoUrl:string;

  count:string;
  
  hubConnection:HubConnection;
  
  constructor(public userService:UserService,public authService:AuthService,private alertifyService:AlertifyService , private router:Router) { }

  ngOnInit() {
    this.authService.currentPhotoUrl.subscribe(
        photoUrl=>{this.photoUrl = photoUrl});

    this.userService.getUnreadCount(this.authService.decodedToken.nameid).subscribe(
      res=>{
        this.authService.unReadCount.next(res.toString());
        this.authService.latestUnreadCount.subscribe(
          res=>{
            this.count=res;
          }
        )
        this.getPaymentForUser();
      }
    )

    this.hubConnection = new HubConnectionBuilder().withUrl("http://localhost:5000/chat").build();
    this.hubConnection.start();
    this.hubConnection.on('count',()=>{
      setTimeout(() => {
        this.userService.getUnreadCount(this.authService.decodedToken.nameid).subscribe(
          res=>{
            this.authService.unReadCount.next(res.toString());
            this.authService.latestUnreadCount.subscribe(
              res=>{
                this.count=res
              }
            )
          }
        )
      }, 3,0);
    })
  }

  login(){
    this.authService.login(this.model).subscribe(
      next=>{this.alertifyService.success("تم الدخول بنجاح");
      
      this.userService.getUnreadCount(this.authService.decodedToken.nameid).subscribe(res=>{
        this.authService.unReadCount.next(res.toString());
        this.authService.latestUnreadCount.subscribe(res=>{this.count=res;});
        this.getPaymentForUser();
      });	       
    },
      error=>{this.alertifyService.error('فشل في الدخول')},
      ()=>{this.router.navigate(['/members'])}
    )
  }

  loggedIn(){
    return this.authService.loggedIn()
  }
  
  loggedOut(){
    localStorage.removeItem('token');

    this.authService.decodedToken=null;
    this.authService.paid=false;

    localStorage.removeItem('user');
    this.authService.currentUser=null;

    this.alertifyService.success('تم الخروج')
    console.log('تم الخروج')
    this.router.navigate([''])
  }

  getPaymentForUser(){
    this.userService.getPaymentForUser(this.authService.currentUser.id).subscribe(
      res=>{
        if(res != null)
          this.authService.paid = true;
        else
          this.authService.paid = false;
      }
    )
  }

  ar(){
    this.authService.language.next('ar');
  }

  en(){
    this.authService.language.next('en');
  }


}
