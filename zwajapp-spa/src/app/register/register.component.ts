import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AlertifyService } from '../services/alertify.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User } from '../models/user';
import { Router } from '@angular/router';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap';

import { defineLocale, arLocale } from 'ngx-bootstrap/chronos';
import { deLocale } from 'ngx-bootstrap/locale';
defineLocale('ar', arLocale);

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  user:User;
  model:any={}
  // eventEmitter مرسل الحدث
  @Output() cancelRegister = new EventEmitter();

  bsConfig : Partial<BsDatepickerConfig>;
  registerForm:FormGroup;
  locale = 'ar';



  constructor(private localeService: BsLocaleService,private router:Router,private authService:AuthService,private fb:FormBuilder,private alertifyService:AlertifyService) 
  {
    this.localeService.use(this.locale);
    }

  ngOnInit() {
    this.createRegisterForm();
    this.bsConfig={
      containerClass:'theme-red',
      showWeekNumbers:false
    }
  }
  register(){
    if(this.registerForm.value){
      this.user=Object.assign({},this.registerForm).value;
      this.authService.register(this.user).subscribe(
        ()=>{this.alertifyService.success("تم الاشتراك بنجاح")},
        error=>{this.alertifyService.error('error')},
        ()=>{this.authService.login(this.user).subscribe(
         ()=>{ this.router.navigate(['/members'])}
        )}
      )
    }     
  }
  
  cancel(){
    console.log('ليس الان');
    //emit يرسل الحدث
    this.cancelRegister.emit(false);
  }
  createRegisterForm(){
    this.registerForm = this.fb.group({
      gender:['رجل'],
      username:['',Validators.required],
     
      knownAs:['',Validators.required],
      dateOfBirth:[null,Validators.required],
      city:['',Validators.required],
      country:['',Validators.required],
      password:['',[Validators.required,Validators.minLength(4),Validators.maxLength(8)]],
      confirmPassword:['',Validators.required],
      
    },{validator : this.passwordMatchValidorts})
  }

  passwordMatchValidorts(form:FormGroup){
    return form.get('password').value === form.get('confirmPassword').value ? null :{mismatch:true}
  }




}
