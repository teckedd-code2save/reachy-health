import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing.page';
import { PatientDashboardPage } from './pages/patient/patient-dashboard.page';
import { PatientConsultationPage } from './pages/patient/patient-consultation.page';
import { DoctorDashboardPage } from './pages/doctor/doctor-dashboard.page';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'patient/dashboard', component: PatientDashboardPage },
  { path: 'patient/consultation', component: PatientConsultationPage },
  { path: 'doctor/dashboard', component: DoctorDashboardPage },
  { path: '**', redirectTo: '' }
];
