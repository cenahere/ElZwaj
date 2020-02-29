import { AuthService } from './../../services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { AlertifyService } from './../../services/alertify.service';
import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {

  @Input() user:User;
  constructor(private alertifyService:AlertifyService, private userService:UserService , public authService:AuthService) { }

  ngOnInit() {
  }
  sendLike(id:number){
    this.userService.sendLike(this.authService.decodedToken.nameid, id).subscribe(
      ()=>{this.alertifyService.success("لقد قمت بالاعجاب ب") + this.user.knownAs},
      error=>{this.alertifyService.error(error);}
    )
  }

}
