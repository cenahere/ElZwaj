import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HTTP_INTERCEPTORS } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorInterceptorService {

       // Application Error يعمل في هذه الحالة كمفتش يبحث عن الاخطاء ويعطي رسالة الخطا
        // HttpRequest لفحص الطلب          HttpHandler  برمتر المفتش
    intercept (req:HttpRequest<any> , next : HttpHandler): Observable<HttpEvent<any>>{
        // استلام الطلب وبداية التعامل معه
        return next.handle(req).pipe(
            // catchError صياد الاخطاء ويضاف من خلال import { catchError } from "rxjs/operators";
              catchError(error=>{
                // جملة If تعمل الاختبار في ال pipe line
                  if(error instanceof HttpErrorResponse){
                      // error.headers متغير يدخل ياخد ال key من ال api
                      const applicationError = error.headers.get('Application-Error');
                      if(applicationError){
                          console.error(applicationError);
                          // يعود بالرسالة كما هي في ال Api
                          return throwError(applicationError);
                      }
                      // Model Error
                      const serverError = error.error;  // متغير يخزن فيه الخطا اللي جاي
                      let modelStateErrors=''; // متغير يضاف فيه الاخطاء
                      if(serverError.errors && typeof serverError.errors ==='object'){ // لو الخطا جاي من السيرفير ونوعة object
                          for(const key in serverError.errors){ // يلف ياخد ال key
                              if(serverError.errors[key]){ // للاحتفاظ بها في كل key  علي  سطر مختلف
                                  modelStateErrors += serverError.errors[key] + '\n';
                              }
                          }
                      }
                      // un authorized errors
                      if(error.status === 401){
                          return throwError (error.statusText);
                      }
                      // return         // تمثل string     // الخطا من اعلي // general error
                      return throwError (modelStateErrors || serverError || 'Server Error')
                  }
              })
          )
      }
  }
  
  // الذي يستدعي في ال appmodeuls in providers
  export const ErrorInterceptorProvider ={
      provide:HTTP_INTERCEPTORS, // نوعة
      useClass:ErrorInterceptorService, // نستخدم ال class  اللي فوق
      multi:true  // يعمل كافتراضي
  }
  