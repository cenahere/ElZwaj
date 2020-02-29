import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { Pagination, PaginationResult } from 'src/app/models/pagination';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from 'src/app/services/alertify.service';


@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {
users:User[];
pagination:Pagination;
likeParam:string;
search:boolean=false;
  constructor(public authService:AuthService,private userService:UserService,private route:ActivatedRoute,private alertify:AlertifyService) { }

  ngOnInit() {
    this.route.data.subscribe(
      data=>{
        this.users = data['users'].result;
        this.pagination= data['users'].pagination;
      }
    );
    this.likeParam='Likers';
  }
  loadUsers() {
    if (!this.search) {
      this.pagination.currentPage=1;
       }
    this.userService.getUsers(this.pagination.currentPage, this.pagination.itemPerPage,null,this.likeParam).subscribe((res: PaginationResult<User[]>) => {
      this.users = res.result;
      this.pagination = res.pagination;

    },
      error => this.alertify.error(error)
    );

}
pageChanged(event: any): void {
  this.pagination.currentPage = event.page;
  this.loadUsers();
}
}
