import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-roles-modal',
  templateUrl: './roles-modal.component.html',
  styleUrls: ['./roles-modal.component.css']
})
export class RolesModalComponent implements OnInit {

  // title: string;
  // closeBtnName: string;
  // list: any[] = [];
  user:User;
  roles:any;
  @Output() updateSeletedRoles = new EventEmitter();
  
  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
  }

  updateRoles(){
    this.updateSeletedRoles.emit(this.roles);
    this.bsModalRef.hide();
  }

}
