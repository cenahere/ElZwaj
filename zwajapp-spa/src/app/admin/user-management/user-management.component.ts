import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { User } from 'src/app/models/user';
import { AlertifyService } from 'src/app/services/alertify.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { RolesModalComponent } from '../roles-modal/roles-modal.component';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users:User[];

  userId:number;
  bsModalRef: BsModalRef;

  constructor(private adminService:AdminService ,private userService : UserService, private modalService: BsModalService, private alertifyService:AlertifyService) { }

  ngOnInit() {
    this.getUsersWithRoles();
  }

  getUsersWithRoles(){
    this.adminService.getUserWithRoles().subscribe(
      (users:User[])=>{
        this.users = users;
      },
      error =>{
        this.alertifyService.error('حدثت مشكلة في جلب المستخدمين');
      }
    )
  }

  editRolesModal(user:User){
    const initialState = {
        user,
        roles:this.getRolesArray(user)

    };
    this.bsModalRef = this.modalService.show(RolesModalComponent, {initialState});
    //this.bsModalRef.content.closeBtnName = 'Close';
    this.bsModalRef.content.updateSeletedRoles.subscribe(
      (values)=>{
        const rolesToUpdate={
          roleNames:[...values.filter(el=>el.checked===true).map(el=>el.value)]
        };
      //  console.log(rolesToUpdate)
        if(rolesToUpdate){
          this.adminService.updateEditRoles(user,rolesToUpdate).subscribe(
            ()=>{
              // spread operator معامل السرد يمكن من سرد عناصر المصفوفة وتنفيذ عليها كود معين
              user.roles=[...rolesToUpdate.roleNames]
            },error=>{this.alertifyService.error(error)}
          )
        }
      }
    )
  }


  private getRolesArray(user) {
    const roles = [];  // مصدر البيانات
    const userRoles = user.roles as any[]; // ادوار المستخدم
    const availableRoles: any[] = [ // الادوار الموجوده
      {name: 'مدير النظام', value: 'Admin'},
      {name: 'مشرف', value: 'Moderator'},
      {name: 'عضو', value: 'Member'},
      {name: 'مشترك', value: 'VIP'},
    ];

    // تطابق بينهم
    availableRoles.forEach(aRole=>{
      let isMatch =false;
      userRoles.forEach(uRole=>{
        if(aRole.value===uRole){
          isMatch=true;
          aRole.checked = true;
          roles.push(aRole);
          return;
         }
      })
      if(!isMatch){
        aRole.checked=false;
        roles.push(aRole);
      }
    })
    return roles;
  }


  getUserReport(){
    this.userService.GetReportForUser(this.userId).subscribe((response)=>{
      let file = new Blob([response], { type: 'application/pdf' });
      var fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
        })
  }
}
