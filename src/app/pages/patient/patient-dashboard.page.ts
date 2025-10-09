import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-dashboard.page.html',
  styleUrl: './patient-dashboard.page.css',
})
export class PatientDashboardPage {
  sidebarOpen = false;
  activeTab: 'reminders' | 'chats' = 'reminders';

  constructor(private router: Router) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  navigateTo(route: string) {
    this.router.navigate([`/patient/${route}`]);
  }
}
