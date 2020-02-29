import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from './services/auth.service';
import { User } from './models/user';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  jwtHelper  = new JwtHelperService();
  title = 'zwajapp-spa';


  constructor(public authService:AuthService) { }

  ngOnInit() {
    const token = localStorage.getItem('token');

    if(token){
      this.authService.decodedToken=this.jwtHelper.decodeToken(token);
    }
    const user : User = JSON.parse(localStorage.getItem('user'));
    if(user){
      this.authService.currentUser=user;
      this.authService.changeMemberPhoto(this.authService.currentUser.photoUrl)
    }
  }
}