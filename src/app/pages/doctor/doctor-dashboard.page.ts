import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-dashboard.page.html',
  styleUrl: './doctor-dashboard.page.css',
})
export class DoctorDashboardPage implements OnInit {
  private router = inject(Router);

  stats = {
    pendingCases: 0,
    todayAppointments: 0,
    criticalAlerts: 0,
    totalPatients: 0,
  };

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit() {
    // Load stats from service
  }

  navigateTo(route: string) {
    this.router.navigate([`/doctor/${route}`]);
  }
}
