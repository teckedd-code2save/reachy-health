import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-white/70 backdrop-blur-md shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Logo/Brand -->
          <div class="flex items-center gap-3">
            @if (showBackButton) {
              <button
                (click)="goBack()"
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  class="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            }
            <h1 class="text-2xl md:text-3xl font-semibold text-blue-600">
              Reachy AI
            </h1>
          </div>

          <!-- Right Side Actions -->
          <div class="flex items-center gap-3">
            @if (showLanguageSelector) {
              <select
                [value]="selectedLanguage"
                (change)="onLanguageChange($event)"
                class="border-2 border-gray-300 rounded-xl px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition text-sm cursor-pointer shadow-sm hover:border-gray-400"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="tw">Twi</option>
                <option value="ga">Ga</option>
                <option value="ha">Hausa</option>
              </select>
            }

            @if (showNotifications) {
              <button
                (click)="onNotificationClick()"
                class="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  class="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                @if (notificationCount && notificationCount > 0) {
                  <span
                    class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"
                  ></span>
                }
              </button>
            }

            @if (showProfile) {
              <button
                (click)="onProfileClick()"
                class="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  class="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            }

            @if (customActions) {
              <ng-container *ngFor="let action of customActions">
                <button
                  (click)="action.onClick()"
                  [class]="action.class"
                  class="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  @if (action.icon) {
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        [attr.d]="action.icon"
                      />
                    </svg>
                  }
                  {{ action.label }}
                </button>
              </ng-container>
            }
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class NavBarComponent {
  @Input() showBackButton = false;
  @Input() showLanguageSelector = false;
  @Input() showNotifications = false;
  @Input() showProfile = false;
  @Input() selectedLanguage = 'en';
  @Input() notificationCount = 0;
  @Input() customActions: Array<{
    label: string;
    onClick: () => void;
    class?: string;
    icon?: string;
  }> = [];

  private router = new Router();

  constructor() {}

  goBack() {
    window.history.back();
  }

  onLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    // Emit event or handle language change
    console.log('Language changed to:', select.value);
  }

  onNotificationClick() {
    // Handle notification click
  }

  onProfileClick() {
    // Handle profile click
  }
}

