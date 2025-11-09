import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConsultationService } from '../../services/consultation.service';

@Component({
  selector: 'app-doctor-consultations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-3">
          <div class="flex items-center gap-3">
            <button (click)="goBack()" class="p-2 hover:bg-gray-100 rounded-lg">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 class="text-2xl md:text-3xl font-semibold text-blue-900">
              Patient Consultations
            </h1>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-8">
        @if (loading()) {
          <div class="flex justify-center py-12">
            <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        }

        @if (!loading() && consultations().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (consultation of consultations(); track consultation.id) {
              <div
                (click)="viewConsultation(consultation.id)"
                class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 hover:border-blue-600"
              >
                <div class="p-4 border-b bg-blue-50">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold text-blue-900">Consultation #{{ consultation.id }}</span>
                    <span class="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                      {{ consultation.status }}
                    </span>
                  </div>
                </div>

                <div class="p-5">
                  <p class="text-sm text-gray-700 line-clamp-3 mb-4">
                    {{ consultation.transcript || 'No description' }}
                  </p>
                  <div class="text-xs text-gray-500">
                    {{ formatDate(consultation.created_at) }}
                  </div>
                </div>

                <div class="px-5 py-4 bg-gray-50 border-t">
                  <button class="text-blue-600 hover:text-blue-900 text-sm font-semibold">
                    View Details →
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class DoctorConsultationsPage implements OnInit {
  private router = inject(Router);
  private consultationService = inject(ConsultationService);

  consultations = signal<any[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadConsultations();
  }

  loadConsultations() {
    this.loading.set(true);
    this.consultationService.getAll().subscribe({
      next: (data) => {
        this.consultations.set(data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  viewConsultation(id: number) {
    this.router.navigate(['/doctor/consultation', id]);
  }

  goBack() {
    this.router.navigate(['/doctor/dashboard']);
  }

  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
