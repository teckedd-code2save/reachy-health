import { Component, signal, inject } from '@angular/core';
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
  private router = inject(Router);

  sidebarOpen = false;
  activeTab: 'reminders' | 'chats' = 'reminders';
  userName = 'Edward Twumasi'; 
  greeting = signal("Good Morning");

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);
  // This would typically come from a user service

  constructor() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting.set("Good Morning");
    } else if (hour < 18) {
      this.greeting.set("Good Afternoon");
    } else {
      this.greeting.set("Good Evening");
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  navigateTo(route: string) {
    this.router.navigate([`/patient/${route}`]);
  }
}
