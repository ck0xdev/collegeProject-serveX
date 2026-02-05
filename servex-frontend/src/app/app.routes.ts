// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { VerifyOtpComponent } from './components/verify-otp/verify-otp.component';
import { ClientProjectsComponent } from './components/client-projects/client-projects.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ServicesComponent } from './components/services/services.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-otp', component: VerifyOtpComponent },
  { path: 'dashboard', component: ClientProjectsComponent }, // Client view
  { path: 'admin/dashboard', component: AdminDashboardComponent }, // Admin view
  { path: 'services', component: ServicesComponent },
  { path: '**', redirectTo: '' }
];