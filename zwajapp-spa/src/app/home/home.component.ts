import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  registerMode:boolean=false;
  constructor(private authService:AuthService,private router:Router) { }

  ngOnInit() {
    if(this.authService.loggedIn()){
      this.router.navigate(['/members'])
    }
  }
  registerToggle(){
    this.registerMode = !this.registerMode;
  }
  
  cancelRegister(mode:boolean){
    this.registerMode=mode;
  }

}
