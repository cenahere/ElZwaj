import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MembersComponent } from './zawjComponents/members/members.component';
import { ListsComponent } from './zawjComponents/lists/lists.component';
import { AuthGuard } from './guards/auth.guard';
import { MemberDetailsComponent } from './zawjComponents/member-details/member-details.component';
import { MemberListResolver } from './resolvers/member-list-resolver';
import { MemeberDetailResolver } from './resolvers/member-details-resolvers';
import { MemberEditComponent } from './zawjComponents/member-edit/member-edit.component';
import { resolve } from 'url';
import { MemeberEditResolver } from './resolvers/member-edit-resolver';
import { PreventUnsavedChangesGuard } from './guards/prevent-unsaved-changes.guard';
import { ListResolver } from './resolvers/lists-Resolver';
import { MessageResolver } from './resolvers/message-resolver';
import { MemberMessagesComponent } from './zawjComponents/member-messages/member-messages.component';
import { MessagesComponent } from './zawjComponents/messages/messages.component';
import { PaymentComponent } from './zawjComponents/payment/payment.component';
import { MessagesGuard } from './guards/messages.guard';
import { ChargeGuard } from './guards/charge.guard';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';


const routes: Routes = [
  {path:'',component:HomeComponent},
  {path:'',
    runGuardsAndResolvers:'always',
    canActivate:[AuthGuard],
    children:[
      {path:'members',component:MembersComponent , resolve:{users:MemberListResolver}},
      {path:'members/edit' , component:MemberEditComponent , resolve:{user:MemeberEditResolver},canDeactivate:[PreventUnsavedChangesGuard]},
      {path:'members/:id',component:MemberDetailsComponent , resolve:{user:MemeberDetailResolver}},
      {path:'lists',component:ListsComponent,resolve:{users:ListResolver}},
      {path:'messages',component:MessagesComponent,resolve:{messages:MessageResolver},canActivate:[MessagesGuard]},
      {path:'charge',component:PaymentComponent , canActivate:[ChargeGuard]},
      { path : 'admin' , component: AdminPanelComponent , data:{ roles:['Admin','Moderator']} }
    ]
  },
  {path:'**',redirectTo:'home',pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
