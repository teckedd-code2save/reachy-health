import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.css',
})
export class LandingPage {
  private router = inject(Router);

  selectedLanguage = 'en';

  languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'tw', name: 'Twi', flag: '🇬🇭' },
    { code: 'ga', name: 'Ga', flag: '🇬🇭' },
  ];

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  onLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const lang = select.value;
    console.log('Language changed to:', lang);
    // Here you can plug in i18n or ngx-translate logic
  }
  navigateToRole(role: 'patient' | 'doctor') {
    this.router.navigate([`/${role}/dashboard`]);
  }
}
