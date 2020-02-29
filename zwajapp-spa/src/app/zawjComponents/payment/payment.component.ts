import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,OnInit
} from '@angular/core';



import {Location} from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
/*
    onDestroy : لان الكارت لابد من تدميرة عند الصفحة 
    AfterViewInit : اول ما يتم تحميل الصفحة وبعد اي تغيير 
*/
export class PaymentComponent implements OnInit,OnDestroy,AfterViewInit {
  // تمكن من الوصول للكارد بعد اعطاءة #cardInfo
  @ViewChild('cardInfo',{static:true}) cardInfo: ElementRef; 

  card: any ; // بيانات الكارد
  cardHandler = this.onChange.bind(this); // مراقب بيانات الكارد
  error: string;
  successPaid:boolean=false; // يظهر بيانات الكارد
  loader:boolean=false; // يظهر ال spinner

  /*
  ChangDetectorRef  مسئول عن مراجعة الكونتنر من خلالة نصل للاخطاء اعتمادا علي اي تغيير في الكارت
  Location: يمكن من التحكم للصفحة بحيث لو ضغطنا علي عوده 
  */
  constructor(private cd: ChangeDetectorRef,
    private userService:UserService,public authService:AuthService ,
    private location:Location,private route:ActivatedRoute) {}

  ngAfterViewInit() {
  // خصائص ياخدها في ال runtime
    const style = {
      base: {
        fontFamily: 'monospace',
        fontSmoothing: 'antialiased',
        fontSize: '21px',
        '::placeholder': {
          color: 'purple'
        }
      }
    };
    // انشاء الكارد 
    this.card = elements.create('card', {hidePostalCode: true ,style: style });
    // يتم انشاء الكارد ويضيف في الصفحة 
    this.card.mount(this.cardInfo.nativeElement);
    // this.card.mount('#card-info'); دي طريقة اخري للوصول للعنصر لو جايين 
    // الحدث المطلوب مراقبتة وبيتشغل
    this.card.addEventListener('change', this.cardHandler);
  }

  ngOnDestroy() {
    // هدم العنصر 
    this.card.removeEventListener('change', this.cardHandler);
    this.card.destroy();
  }
 // مراقب الكارد اظهار الاخطاء
  onChange({ error }) {
    if (error) {
      this.loader=false;
      if(error.message==='Your card number is incomplete.')
      this.error="رقم بطاقتك غير صحيح"
      if(error.message==="Your card's expiration date is incomplete.")
      this.error="تاريخ إنتهاء البطاقة غير صحيح"
      if(error.message==="Your card's security code is incomplete.")
      this.error="كود الحماية غير صحيح"


    } else {
      this.error = null;
    }
    this.cd.detectChanges();
  }


  ngOnInit() {

  }
  /*
  التشغيل واستخدام الاسينك لانه سيعمل علي تمرير الاستريب اولا وهيمرر التوكن في الاي بي اي 
  */ 
  async onSubmit() {

    const { token, error } = await stripe.createToken(this.card);

    if (error) {
      console.log('حدث خطأ في السداد', error);
    } else {

      this.userService.charge(this.authService.currentUser.id,token.id.toString()).subscribe(
        // المشترك يربط القيمة بالدقع 
        res=>{
         this.successPaid=res['isPaid'];
         setTimeout(() => {
          this.authService.paid=res['isPaid'];
         }, 2000);
        }
      )
    }
  }
  // يرجع لاخر صفحة كنت عليها
  backClicked() {
    this.location.back();
  }
  load(){
    if(this.error===null)
    this.loader=true;
    else this.loader=false;
  }

}
