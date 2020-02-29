import { Directive, OnInit, ElementRef, AfterViewInit } from '@angular/core';
// تجاهل اي خطأ 
// @ts-ignore
import * as words from '../../assets/jsons/dictionary.json'
// يجب التاكد من ان الاستدعاء بالا js في اخرة
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[lang]',
})
export class LangDirective implements OnInit , AfterViewInit  {
   
  // مصفوفه للمساواه بكلمات القاموي
  _words = [];

  // elementRef يمثل العنصر المطبق عليه ال directive
  constructor(private ref : ElementRef,private authService:AuthService) { }

  ngOnInit() {
    // لجلب كل كلمات القاموس متمثله في المصفوفه مع بداية عمل الكومبوننت
    this._words = words.default;
  }
  // مع بداية ظهور العنصر او بعد تحميل كامل الصفحة
  ngAfterViewInit() {
    this.authService.lang.subscribe(
      lang=>{
        if(lang == 'en'){
          try{
            // نعمل فلتر بحيث نري الكلام المطابق في القاموس
              var word = this._words.filter(word=>word['ar'].match(this.ref.nativeElement.innerText));
              // لو تم التطابق يساويها بالنص الظاهر علي العنصر يغيرها للغة الانجليزية الموجوده في القاموس
              if(word[0]['ar']==this.ref.nativeElement.innerText)
              this.ref.nativeElement.innerText = word[0]['en'];
          }catch{}
        }

        if(lang == 'ar'){
          try{
              var word = this._words.filter(word=>word['en'].match(this.ref.nativeElement.innerText));
              if(word[0]['en']==this.ref.nativeElement.innerText)
              this.ref.nativeElement.innerText = word[0]['ar'];
          }catch{}
        }
      }
    )
  }

}
