import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LandingPage } from './pages/landing-page/landing-page';
import { Registration } from './pages/registration/registration';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatNavList } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { Attendees } from './pages/admin/components/attendees/attendees';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { Layout } from './pages/admin/layout/layout';
import { Dashboard } from './pages/admin/components/dashboard/dashboard';
import { Register } from './pages/admin/components/register/register';
import { CodeChecker } from './pages/admin/components/code-checker/code-checker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { HttpClientModule } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { Custom } from './shared/custom-snack';

@NgModule({
  declarations: [
    App,
    LandingPage,
    Registration,
    Attendees,
    Layout,
    Dashboard,
    Register,
    CodeChecker,
    Custom
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatIconModule,
    MatSidenavModule,
    MatNavList,
    MatTableModule,
    NgChartsModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ],
  bootstrap: [App]
})
export class AppModule { }
