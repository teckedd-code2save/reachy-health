import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.css'
})
export class LandingPage {
  selectedLanguage = 'en';
  
  languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'tw', name: 'Twi', flag: '🇬🇭' },
    { code: 'ga', name: 'Ga', flag: '🇬🇭' }
  ];

  constructor(private router: Router) {}

  setLanguage(code: string) {
    this.selectedLanguage = code;
    localStorage.setItem('preferredLanguage', code);
  }

  navigateToRole(role: 'patient' | 'doctor') {
    this.router.navigate([`/${role}/dashboard`]);
  }
}
