import { PaginationResult } from './../../models/pagination';
import { Component, OnInit } from '@angular/core';
import { AlertifyService } from 'src/app/services/alertify.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user';
import { ActivatedRoute } from '@angular/router';
import { Pagination } from 'src/app/models/pagination';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit {
  users:User[]

  constructor(public authService:AuthService,private userSevice:UserService , private alertifyService:AlertifyService , private route:ActivatedRoute) { }

  pagination:Pagination;

  user:User=JSON.parse(localStorage.getItem('user'));
  genderList=[
    {value:'رجل' , display : 'رجال'},
    {value:'إمرأة' , display : 'نساء'}
  ];
  userParams:any={}

  ngOnInit() {

    this.authService.lang.subscribe(
      lang=>{
        if(lang=='en'){
          this.genderList=[{value:'رجل',display:'Males'},
                          {value:'إمرأة',display:'Females'}]
        }else{
          this.genderList=[{value:'رجل',display:'رجال'},
                            {value:'إمرأة',display:'نساء'}]
        }
      }
    )

    this.route.data.subscribe(data=>{
      this.users=data['users'].result;
      this.pagination=data['users'].pagination;
    });
    this.userParams.gender = this.user.gender === "رجل"?'إمرأة':'رجل';
    this.userParams.minAge=18;
    this.userParams.maxAge=99;
    this.userParams.orderBy='lastActive'

    // this.loadUsers();
  }

  resetFilter(){
    // لكي يعود بالقيم الافتراضية
    this.userParams.gender= this.user.gender === 'رجل'?'إمرأة':'رجل';
    this.userParams.minAge=18;
    this.userParams.maxAge=99;
    this.userParams.orderBy='lastActive'
  }

  loadUsers(){
    this.userSevice.getUsers(this.pagination.currentPage, this.pagination.itemPerPage ,this.userParams).subscribe((res:PaginationResult<User[]>)=>{
      (users:User[])=>{this.users=users}
      this.users=res.result;
      this.pagination=res.pagination;
      },
      error=>this.alertifyService.error(error))
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadUsers();
  }
}
