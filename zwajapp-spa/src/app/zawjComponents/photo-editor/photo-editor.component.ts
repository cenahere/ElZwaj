import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Photo } from 'src/app/models/Photo';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { ActivatedRoute } from '@angular/router';
import { FileUploader } from 'ng2-file-upload';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  // من الاب للابن 
  @Input() photos:Photo[];
  @Output() getMemberPhotoChange = new EventEmitter<string>();

  uploader: FileUploader;
  hasBaseDropZoneOver = false;
  baseUrl = environment.baseUrl;

  currentMain : Photo;
  user:User;

  

  constructor(private authService: AuthService , private userService:UserService ,
              private alertifyService:AlertifyService , private route:ActivatedRoute) { }

  ngOnInit() {
    // this.route.data.subscribe(data=>
    //   {this.user = data['user']})
    this.initializeUploader();
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  initializeUploader() {
    this.uploader = new FileUploader(
      {
        url: this.baseUrl + 'user/' + this.authService.decodedToken.nameid + '/photo',
        authToken: 'Bearer ' + localStorage.getItem('token'),
        isHTML5: true,
        allowedFileType: ['image'],
        removeAfterUpload: true,
        autoUpload: false,
        maxFileSize: 10 * 1024 * 1024,
        
      }
    );
    // to upload photo and appear at the same time
    this.uploader.onAfterAddingFile=(file)=>{file.withCredentials=false;};
    this.uploader.onSuccessItem=(item,Response,status,headers)=>{
      if(Response){
        const res:Photo = JSON.parse(Response);
        const photo ={
          id:res.id,
          url:res.url,
          dateAdded:res.dateAdded,
          isMain:res.isMain,
          
          isApproved:res.isApproved
        };
        this.photos.push(photo);

        if(this.photos.push(photo)){
          this.authService.changeMemberPhoto(photo.url);
          this.authService.currentUser.photoUrl=photo.url;
          localStorage.setItem('user',JSON.stringify(this.authService.currentUser));
        }
      }
    }
  }
  setMainPhoto(photos:Photo){
    this.userService.setMainPhoto(this.authService.decodedToken.nameid , photos.id).subscribe(
      ()=>{this.currentMain = this.photos.filter(p=>p.isMain === true)[0]
          this.currentMain.isMain = false ;
          photos.isMain=true  
        // this.getMemberPhotoChange.emit(photos.url)
        this.authService.changeMemberPhoto(photos.url)
        this.authService.currentUser.photoUrl=photos.url;
        localStorage.setItem('user',JSON.stringify(this.authService.currentUser))
      },
      error=>{this.alertifyService.error('يوجد مشكله في تعيين الصورة الاساسية')}
    )
  }
  deletePhoto(id:number){
    this.alertifyService.confirm("هل تريد حذف الصورة ؟",()=>{
      this.userService.deletePhoto(this.authService.decodedToken.nameid,id).subscribe(
        ()=>{
          this.photos.splice(this.photos.findIndex(p=>p.id==id),1);
          this.alertifyService.success("تم حذف الصورة بنجاح")
        },
        error=>{this.alertifyService.error(error)}
      )
    })
  }
}
