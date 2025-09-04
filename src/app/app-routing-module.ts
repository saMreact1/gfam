import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import { Registration } from './pages/registration/registration';
import { Layout } from './pages/admin/layout/layout';
import { Dashboard } from './pages/admin/components/dashboard/dashboard';
import { Attendees } from './pages/admin/components/attendees/attendees';
import { Register } from './pages/admin/components/register/register';
import { CodeChecker } from './pages/admin/components/code-checker/code-checker';

const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'register', component: Registration },
  { path: 'admin', component: Layout, 
    children: [
      { path: '', component: Dashboard },
      { path: 'attendees', component: Attendees },
      { path: 'register', component: Register },
      { path: 'checker', component: CodeChecker }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
