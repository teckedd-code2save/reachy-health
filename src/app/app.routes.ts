import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing.page';
import { PatientDashboardPage } from './pages/patient/patient-dashboard.page';
import { ConsultationDetailPage } from './pages/patient/consultation-detail.page';
import { DoctorDashboardPage } from './pages/doctor/doctor-dashboard.page';
import { NewConsultationPage } from './pages/patient/new-consultation.page';
import { ConsultationsListPage } from './pages/patient/consultation-list.page';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'patient/dashboard', component: PatientDashboardPage },
  { path: 'patient/records', component: ConsultationsListPage },
  
  // IMPORTANT: More specific routes MUST come before dynamic routes
  { path: 'patient/consultation/new', component: NewConsultationPage },
  { path: 'patient/consultation/:id', component: ConsultationDetailPage },
  
  { path: 'doctor/dashboard', component: DoctorDashboardPage },
  { path: '**', redirectTo: '' }
];