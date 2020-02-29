import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../models/user';
import { BehaviorSubject } from 'rxjs';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';

@Injectable()

export class AuthService {
  jwtHelper = new JwtHelperService();

  siteLang:string='ar';
  dir:string = 'rtl';

  decodedToken:any;

  currentUser:User;

  // تحديد المسار 
  photoUrl = new BehaviorSubject<string>('../../assets/default user pic.png');
  // تحديد الصورة
  currentPhotoUrl = this.photoUrl.asObservable();

  unReadCount = new BehaviorSubject<string>('');
  latestUnreadCount=this.unReadCount.asObservable();

  HubConnection :HubConnection=new HubConnectionBuilder().withUrl("http://localhost:5000/chat").build();


  paid:boolean=false;


  language = new BehaviorSubject<string>('ar');
  lang = this.language.asObservable();
  
  constructor(private http: HttpClient) {
    this.lang.subscribe(
      lang=>{
        if(lang == 'en'){
          this.dir = 'ltr';
          this.siteLang = 'en';
        }else{
          this.dir = 'rtl';
          this.siteLang = 'ar';
        }
      }
    );
   }

  login(model:any){
    return this.http.post(environment.baseUrl + "auth/login" , model).pipe(
      map((reponse:any)=>{
        const user = reponse;
        if(user) {localStorage.setItem('token',user.token)};

        localStorage.setItem('user',JSON.stringify(user.user));
        this.currentUser=user.user;
        this.changeMemberPhoto(this.currentUser.photoUrl)

        this.decodedToken = this.jwtHelper.decodeToken(user.token);
        console.log(this.decodedToken);
      })
    )
  }

  register(user:any){
    return this.http.post(environment.baseUrl + 'auth/register' , user);
  }

  loggedIn(){
    try {
      const token = localStorage.getItem('token');
      return !this.jwtHelper.isTokenExpired(token);
    } catch {
      return false;
    }
  }

  changeMemberPhoto(newPhotoUrl:string){
    this.photoUrl.next(newPhotoUrl);
  }

  roleMatch(AllowRoles):boolean{
    let isMatch=false;
    const userRoles=this.decodedToken.role as Array<string>;
    AllowRoles.forEach(element=>{
      if(userRoles.includes(element)){
        isMatch=true;
        return;
      }
    });
    return isMatch;
  }
}
