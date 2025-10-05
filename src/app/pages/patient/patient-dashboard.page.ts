import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-dashboard.page.html',
  styleUrl: './patient-dashboard.page.css'
})
export class PatientDashboardPage {
  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([`/patient/${route}`]);
  }
}
