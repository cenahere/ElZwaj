import { Component, OnInit } from '@angular/core';
import { Message } from 'src/app/models/message';
import { Pagination, PaginationResult } from 'src/app/models/pagination';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  messages: Message[];
  pagination: Pagination;
  messageType = 'Unread';
  constructor(private userService:UserService,private authService:AuthService,private route:ActivatedRoute,private alertify:AlertifyService) { }

  ngOnInit() {
    this.route.data.subscribe(
      data=>{
        this.messages = data['messages'].result;
        this.pagination = data['messages'].pagination;
      }
    );
  }

  loadMessages(){
    this.userService.getMessages(this.authService.decodedToken.nameid,this.pagination.currentPage,this.pagination.itemPerPage,this.messageType).subscribe(
      (res:PaginationResult<Message[]>)=>{
        this.messages = res.result;
        this.pagination = res.pagination;
      },
      error=>this.alertify.error(error)
    )
  }

  pageChanged(event:any):void{
    this.pagination.currentPage= event.page;
    this.loadMessages();
  }


  deleteMessage(id:number){
    this.alertify.confirm('هل انت متاكد من حذف الرسالة',()=>{
      this.userService.deleteMessage(id,this.authService.decodedToken.nameid).subscribe(
        ()=>{this.messages.splice(this.messages.findIndex(m=>m.id==id),1);
        this.alertify.success('تم حذف الرسالة بنجاح');}
      ),error=>{this.alertify.error(error);}
    });
  }

}
