import { ListResolver } from './resolvers/lists-Resolver';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import {  ErrorInterceptorProvider } from './services/error-interceptor.service';
import { AlertifyService } from './services/alertify.service';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDropdownModule, TabsModule, BsDatepickerModule, PaginationModule, ButtonsModule, ModalModule } from 'ngx-bootstrap';
import { MembersComponent } from './zawjComponents/members/members.component';
import { ListsComponent } from './zawjComponents/lists/lists.component';
import { AuthGuard } from './guards/auth.guard';
import { UserService } from './services/user.service';
import { JwtModule } from '@auth0/angular-jwt';
import { MemberCardComponent } from './zawjComponents/member-card/member-card.component';
import { MemberDetailsComponent } from './zawjComponents/member-details/member-details.component';
import { MemberListResolver } from './resolvers/member-list-resolver';
import { MemeberDetailResolver } from './resolvers/member-details-resolvers';
import { NgxGalleryModule } from 'ngx-gallery';
import {TimeAgoPipe} from 'time-ago-pipe';

export function tokenGetter(){
  return localStorage.getItem('token');
}


/* Custom Hammer configuration */
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import * as Hammer from 'hammerjs';
import { MemberEditComponent } from './zawjComponents/member-edit/member-edit.component';
import { MemeberEditResolver } from './resolvers/member-edit-resolver';
import { PreventUnsavedChangesGuard } from './guards/prevent-unsaved-changes.guard';
import { PhotoEditorComponent } from './zawjComponents/photo-editor/photo-editor.component';
import { FileSelectDirective, FileUploader, FileUploadModule } from 'ng2-file-upload';
import { MessageResolver } from './resolvers/message-resolver';
import { MemberMessagesComponent } from './zawjComponents/member-messages/member-messages.component';
import { MessagesComponent } from './zawjComponents/messages/messages.component';
import { PaymentComponent } from './zawjComponents/payment/payment.component';
import { ChargeGuard } from './guards/charge.guard';
import { MessagesGuard } from './guards/messages.guard';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { HasRoleDirective } from './directives/has-role.directive';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { PhotoManagementComponent } from './admin/photo-management/photo-management.component';
import { AdminService } from './services/admin.service';
import { RolesModalComponent } from './admin/roles-modal/roles-modal.component';
import { LangDirective } from './directives/lang.directive';

export class CustomHammerConfig extends HammerGestureConfig {
  overrides = {
    'pan': {
      direction: Hammer.DIRECTION_ALL,
    }
  }
}
/* End Custom hammer configuration */

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    RegisterComponent,
    HomeComponent,
    MembersComponent,
    ListsComponent,
    MemberCardComponent,
    MemberDetailsComponent,
    MemberEditComponent,
    PhotoEditorComponent,
    TimeAgoPipe,
    MemberMessagesComponent,
    MessagesComponent,
    PaymentComponent,
    AdminPanelComponent,
    HasRoleDirective,
    UserManagementComponent,
    PhotoManagementComponent,
    RolesModalComponent,
    LangDirective,
      
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxGalleryModule,
    ModalModule.forRoot(),

    // important new to upload photo
    FileUploadModule ,

    PaginationModule.forRoot(),
    ButtonsModule.forRoot(),


    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),

    BsDatepickerModule.forRoot(),

    TabsModule.forRoot(),

    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: ['localhost:5000'],
        blacklistedRoutes: ['localhost:5000/auth']
      }
    })


  ],
  providers: [
    AuthService,
    ErrorInterceptorProvider,
    AlertifyService,
    AuthGuard,
    UserService,
    MemberListResolver,
    MemeberDetailResolver,
    {provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig},
    MemeberEditResolver,
    PreventUnsavedChangesGuard,
    ListResolver,
    MessageResolver,
    ChargeGuard,
    MessagesGuard,
    AdminService
  ],
  entryComponents:[
    RolesModalComponent
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
