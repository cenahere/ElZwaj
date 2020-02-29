import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/models/user';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from 'src/app/services/alertify.service';
import { NgForm } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {
  user:User;
  @ViewChild('editForm',{static:true}) editForm:NgForm;

  photoUrl:string;

  constructor(private route:ActivatedRoute ,private authService:AuthService , private userService:UserService,private alertifyService:AlertifyService) { }

  ngOnInit() {
    this.route.data.subscribe(data=>
      {this.user=data['user']}
    )
    this.authService.currentPhotoUrl.subscribe(photoUrl=>this.photoUrl=photoUrl)
  }
  updateUser(){
    this.userService.updateUser(this.authService.decodedToken.nameid,this.user).subscribe(
          ()=> {this.alertifyService.success('تم تعديل الملف الشخصي بنجاح');
              this.editForm.reset(this.user);
          },error=>{this.alertifyService.error(error)}   
    )
  }
  updateMainPhoto(photoUrl){
    this.user.photoUrl=photoUrl;
  }

}
