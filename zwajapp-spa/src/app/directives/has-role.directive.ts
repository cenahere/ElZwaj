import { Directive, Input, ViewContainerRef, TemplateRef, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[hasRole]'
})
export class HasRoleDirective implements OnInit {

  // يستقبل الداتا من ال Html Dom
  @Input() hasRole: string[];
  // خاصية في حالة العنصر ظاهر
  isVisible = false;

  // templateRef<any> لتمرير اي نوع
  constructor(private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private authService: AuthService) { }

  ngOnInit() {
    // الحصول علي الرتبة
   const userRoles = this.authService.decodedToken.role as Array<string>;
   // لو مفيش رتب نفرغ الكونتينر
   if(!userRoles)
                  this.viewContainerRef.clear();
    // لو حدث تطابق في الرتبه يظهر محتوي ال Html او يظهر العنصر 
   if(this.authService.roleMatch(this.hasRole)){
     if(!this.isVisible){
       this.isVisible=true;
       // انشاء العنصر واظهار محتواه
       this.viewContainerRef.createEmbeddedView(this.templateRef);
     }else{
       this.isVisible = false;
       this.viewContainerRef.clear();
     }
   }
  }
}

