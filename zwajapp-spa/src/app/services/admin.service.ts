import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http:HttpClient) { }


  getUserWithRoles(){
    return this.http.get(environment.baseUrl +'admin/' +'userWithRoles');
  }

  updateEditRoles(user:User,roles:{}){
    return this.http.post(environment.baseUrl +'admin/' +'editroles/'+ user.userName , roles, {})
  }

  getPhotosForApproval() {
    return this.http.get(environment.baseUrl +'admin/' + 'photosForModeration');
  }

  approvePhoto(photoId) {
    return this.http.post(environment.baseUrl +'admin/' +'approvePhoto/' + photoId, {});
  }

  rejectPhoto(photoId) {
    return this.http.post(environment.baseUrl +'admin/' +'rejectPhoto/' + photoId, {});
  }
}
