import { Component, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';
import { TabsetComponent } from 'ngx-bootstrap';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.css']
})
export class MemberDetailsComponent implements OnInit ,  AfterViewChecked {
  ngAfterViewChecked(): void {
    setTimeout(()=>{
      this.paid=this.authServie.paid;
    },0);
  }
 user:User;
 galleryOptions: NgxGalleryOptions[];
 galleryImages: NgxGalleryImage[];

 created:string;
 age:string;
 options = {weekday : 'long' , year :'numeric' , month : 'long',day:'numeric'};

 showIntro:boolean;
 showLook:boolean;
 showHobby:boolean;

 paid:boolean = false;

 
 @ViewChild('memberTabs',{static:true}) memberTabs:TabsetComponent;

 constructor(private userService:UserService,private authServie:AuthService,  private alertifyService:AlertifyService , private route:ActivatedRoute) { }

  ngOnInit() {
    this.route.data.subscribe(data=>{
      this.user=data['user']
    });
    this.galleryOptions=[{
      width:'500px',
      height:'500px',
      imagePercent:100,
      thumbnailsColumns:4,
      imageAnimation:NgxGalleryAnimation.Slide,
      preview:false
    }]
    this.galleryImages = this.getImages();

    this.created = new Date(this.user.created).toLocaleString("ar-EG",this.options).replace("،","");
    this.age = this.user.age.toLocaleString('ar-EG');

    this.showIntro=true;
    this.showLook=true;
    this.showHobby=true;


    this.route.queryParams.subscribe(
      params=>{
        const selectTabs=params['tab'];
        this.memberTabs.tabs[selectTabs>0?selectTabs:0].active=true;
      }
    )

    this.paid = this.authServie.paid;
    // this.loadUser();
  }
  
  getImages(){
    const imageUrls = [];
    for(let i =0 ; i< this.user.photos.length ; i++){
      imageUrls.push({
        small:this.user.photos[i].url,
        medium:this.user.photos[i].url,
        big:this.user.photos[i].url
      })
    };
    return imageUrls;
  }

  // loadUser(){
  //   this.userService.getUser(+this.route.snapshot.params['id']).subscribe(
  //     (user:User)=>{this.user=user},
  //     error=>{this.alertifyService.error(error)}
  //   )
  // }

  selectTabs(tabId:number){
    this.memberTabs.tabs[tabId].active=true;
  }
  deSelect(){
    this.authServie.HubConnection.stop();
  }

}
