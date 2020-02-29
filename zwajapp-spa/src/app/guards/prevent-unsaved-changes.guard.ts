import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate } from '@angular/router';
import { AlertifyService, ConfirmResult } from '../services/alertify.service';
import { MemberEditComponent } from '../zawjComponents/member-edit/member-edit.component';



@Injectable({
  providedIn: 'root'
})
export class PreventUnsavedChangesGuard implements CanDeactivate<MemberEditComponent> {
  x = false;
  constructor(private alertify: AlertifyService) { }

  async canDeactivate(component: MemberEditComponent) {

    if (component.editForm.dirty) {

      const confirm = await this.alertify.promisifyConfirm('انتبة ', 'تم تعديل البيانات الخاصة بك هل تود الاستمرار بدون حفظ البيانات');
      if (confirm == ConfirmResult.Ok) { this.x = true } else {
        this.x = false;
      }
      return this.x;

    }
    return true
  }
}
