import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import { Registration } from './pages/registration/registration';
import { OtpVerification } from './pages/otp-verification/otp-verification';
import { Layout } from './pages/admin/layout/layout';
import { Dashboard } from './pages/admin/components/dashboard/dashboard';
import { Attendees } from './pages/admin/components/attendees/attendees';
import { Register } from './pages/admin/components/register/register';
import { CodeChecker } from './pages/admin/components/code-checker/code-checker';
import { AdminLogin } from './pages/admin/auth/login/login';
import { ForgotPassword } from './pages/admin/auth/forgot-password/forgot-password';
import { InviteUser } from './pages/admin/components/invite-user/invite-user';
import { ChangePassword } from './pages/admin/components/change-password/change-password';
import { Users } from './pages/admin/components/users/users';
import { authGuard, adminGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'register', component: Registration },
  { path: 'otp-verification', component: OtpVerification },
  { path: 'admin/login', component: AdminLogin },
  { path: 'admin/forgot-password', component: ForgotPassword },
  { path: 'admin', component: Layout, canActivate: [authGuard],
    children: [
      { path: '', component: Dashboard },
      { path: 'attendees', component: Attendees },
      { path: 'register', component: Register },
      { path: 'checker', component: CodeChecker },
      { path: 'invite-user', component: InviteUser, canActivate: [adminGuard] },
      { path: 'change-password', component: ChangePassword },
      { path: 'users', component: Users, canActivate: [adminGuard] }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
