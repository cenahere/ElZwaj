import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertifyService } from 'src/app/services/alertify.service';
import { Message } from 'src/app/models/message';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit, AfterViewChecked {
  ngAfterViewChecked(): void {
    this.panel.nativeElement.scrollTop = this.panel.nativeElement.scrollHeight;
  }


  @Input() recipientId: number;
  messages: Message[];
  newMessage: any = {};

  hubConnection: HubConnection;
  hubConnection2: HubConnection;

  @ViewChild('panel', { static: true }) panel: ElementRef<any>;

  constructor(private userService: UserService, private authService: AuthService, private alertifySevcie: AlertifyService) { }

  ngOnInit() {
    this.loadMessage();

    this.authService.HubConnection = new HubConnectionBuilder().withUrl("http://localhost:5000/chat").build();
    this.authService.HubConnection.start();
    this.authService.HubConnection.on("refresh", () => {
      this.loadMessage();
      this.hubConnection2 = new HubConnectionBuilder().withUrl("http://localhost:5000/chat").build();

    })
  }

  loadMessage() {
    const currentUserId = +this.authService.decodedToken.nameid;

    this.userService.getConverstion(this.authService.decodedToken.nameid, this.recipientId).pipe(
      tap(messages => {

        for (const message of messages) {
          if (message.isRead === false && message.recipientId === currentUserId) { this.userService.markAsRead(currentUserId, message.id); }
        };

      })
    ).subscribe(
      messages => { this.messages = messages.reverse() },
      error => { this.alertifySevcie.error(error) },

      () => {
        setTimeout(() => {
          this.userService.getUnreadCount(this.authService.decodedToken.nameid).subscribe(
            res => {
              this.authService.unReadCount.next(res.toString());
              setTimeout(() => {
                this.userService.getConverstion(this.authService.decodedToken.nameid, this.recipientId).subscribe(
                  messages => {
                    this.messages = messages.reverse();
                  }
                );
              }, 3000)
            }
          )
        }, 1000)
      }
    )
  }


  sendMessage(){
    this.newMessage.recipientId=this.recipientId;
    this.userService.sendMessage(this.authService.decodedToken.nameid , this.newMessage).subscribe(
      (message:Message)=>{
        this.messages.push(message);
        this.newMessage.content='';

        this.authService.HubConnection.invoke('refresh')
      },error=>{this.alertifySevcie.error(error);},
      ()=>{
        setTimeout(()=>{
          this.hubConnection2.invoke('count'),
          this.userService.getConverstion(this.authService.decodedToken.nameid,this.recipientId).subscribe(
              messages=>{
                this.messages= messages.reverse()

              }
            )
        },0);
      }
    )


  }






}

