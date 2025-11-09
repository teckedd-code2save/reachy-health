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
  greeting = signal('Good Morning');
  selectedTrend = signal<'bp' | 'hr' | 'sugar' | 'bmi' | null>(null);
  healthData = signal<any>(null);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);
  // This would typically come from a user service

  constructor() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting.set('Good Morning');
    } else if (hour < 18) {
      this.greeting.set('Good Afternoon');
    } else {
      this.greeting.set('Good Evening');
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  navigateTo(route: string) {
    this.router.navigate([`/patient/${route}`]);
  }

  openTrendModal(metric: 'bp' | 'hr' | 'sugar' | 'bmi') {
    this.selectedTrend.set(metric);
  }

  closeTrendModal() {
    this.selectedTrend.set(null);
  }

  getTrendData(metric: 'bp' | 'hr' | 'sugar' | 'bmi') {
    // Mock data - replace with actual API calls
    const trends = {
      bp: {
        title: 'Blood Pressure Trend',
        unit: 'mmHg',
        color: 'blue',
        data: [120, 118, 122, 115, 112, 110, 108],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        current: '112/75',
        change: '-3%',
        status: 'Improving',
      },
      hr: {
        title: 'Heart Rate Trend',
        unit: 'bpm',
        color: 'green',
        data: [72, 74, 70, 73, 72, 71, 72],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        current: '72 bpm',
        change: 'Stable',
        status: 'Normal',
      },
      sugar: {
        title: 'Blood Sugar Trend',
        unit: 'mg/dL',
        color: 'yellow',
        data: [95, 98, 94, 97, 96, 95, 95],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        current: '95 mg/dL',
        change: 'Stable',
        status: 'Monitor',
      },
      bmi: {
        title: 'BMI Trend',
        unit: '',
        color: 'purple',
        data: [25.5, 25.3, 25.4, 25.2, 25.1, 25.0, 25.0],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        current: '25.0',
        change: '-0.5',
        status: 'Improving',
      },
    };
    return trends[metric];
  }

  getHeightPercent(value: number, data: number[]): number {
    const max = Math.max(...data);
    return max > 0 ? (value / max) * 100 : 0;
  }

  hasHealthData(): boolean {
    return this.healthData() !== null;
  }

  connectHealthDevice() {
    // Simulate connecting to a health device and fetching data
    // In production, this would integrate with Fitbit, Apple Health, etc.
  //   this.healthData.set(
  //     {
  //     bp: '112/75',
  //     bpStatus: 'Normal',
  //     hr: 72,
  //     hrStatus: 'Good',
  //     sugar: 95,
  //     sugarStatus: 'Watch',
  //     bmi: 25.0,
  //     bmiStatus: 'Elevated'
  //   }
  // );
  }
}
