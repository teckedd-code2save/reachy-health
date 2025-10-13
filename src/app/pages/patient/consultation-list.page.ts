import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConsultationService } from '../../services/consultation.service';

@Component({
  selector: 'app-consultations-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div
            class="rounded-lg shadow-lg p-2 md:p-3 flex items-center justify-between"
          >
            <button
              (click)="goBack()"
              class="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
            <h1 class="text-xl font-medium md:text-2xl text-blue-500">
              My Consultations
            </h1>
            <button
              (click)="createNewConsultation()"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Consultation
            </button>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-8">
        <!-- Loading State -->
        @if (loading()) {
          <div class="flex justify-center items-center py-12">
            <svg
              class="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        }

        <!-- Error State -->
        @if (errorMessage() && !loading()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <svg
                class="w-5 h-5 text-red-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div class="flex-1">
                <p class="text-sm text-red-700">{{ errorMessage() }}</p>
              </div>
              <button
                (click)="loadConsultations()"
                class="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        }

        <!-- Empty State -->
        @if (!loading() && consultations().length === 0 && !errorMessage()) {
          <div class="text-center py-12">
            <svg
              class="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">
              No consultations yet
            </h3>
            <p class="mt-2 text-sm text-gray-500">
              Get started by creating your first consultation
            </p>
            <button
              (click)="createNewConsultation()"
              class="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Consultation
            </button>
          </div>
        }

        <!-- Consultations Grid -->
        @if (!loading() && consultations().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (consultation of consultations(); track consultation.id) {
              <div
                (click)="viewConsultation(consultation.id)"
                class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              >
                <!-- Card Header -->
                <div class="p-4 border-b bg-gray-50">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-600"
                      >ID: {{ consultation.id }}</span
                    >
                    <span [class]="getStatusClass(consultation.status)">
                      {{ consultation.status }}
                    </span>
                  </div>
                </div>

                <!-- Card Content -->
                <div class="p-4">
                  <!-- Transcript Preview -->
                  <div class="mb-3">
                    <p class="text-sm text-gray-600 line-clamp-3">
                      {{ consultation.transcript || 'No description provided' }}
                    </p>
                  </div>

                  <!-- Meta Information -->
                  <div class="space-y-2 text-xs text-gray-500">
                    <div class="flex items-center">
                      <svg
                        class="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {{ formatDate(consultation.created_at) }}
                    </div>
                    <div class="flex items-center">
                      <svg
                        class="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        />
                      </svg>
                      {{ consultation.language?.toUpperCase() || 'EN' }}
                    </div>
                    @if (
                      consultation.chat_messages &&
                      consultation.chat_messages.length > 0
                    ) {
                      <div class="flex items-center">
                        <svg
                          class="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        {{ consultation.chat_messages.length }} messages
                      </div>
                    }
                    @if (
                      consultation.file_attachments &&
                      consultation.file_attachments.length > 0
                    ) {
                      <div class="flex items-center">
                        <svg
                          class="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                        {{ consultation.file_attachments.length }} files
                      </div>
                    }
                  </div>
                </div>

                <!-- Card Footer -->
                <div class="px-4 py-3 bg-gray-50 border-t">
                  <button
                    (click)="
                      viewConsultation(consultation.id);
                      $event.stopPropagation()
                    "
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    View Details
                    <svg
                      class="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }

        <!-- Refresh Button -->
        @if (!loading() && consultations().length > 0) {
          <div class="mt-8 text-center">
            <button
              (click)="loadConsultations()"
              class="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              🔄 Refresh List
            </button>
          </div>
        }
      </main>
    </div>
  `,
  styles: [
    `
      .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: capitalize;
      }

      .status-pending {
        background-color: #fef3c7;
        color: #92400e;
      }

      .status-active,
      .status-in_progress {
        background-color: #dbeafe;
        color: #1e40af;
      }

      .status-completed {
        background-color: #d1fae5;
        color: #065f46;
      }

      .status-cancelled {
        background-color: #fee2e2;
        color: #991b1b;
      }
    `,
  ],
})
export class ConsultationsListPage implements OnInit {
  private router = inject(Router);
  private consultationService = inject(ConsultationService);

  // Signals
  consultations = signal<any[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  // Computed signal for total count
  totalCount = computed(() => this.consultations().length);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit() {
    this.loadConsultations();
  }

  loadConsultations() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.consultationService.getAll().subscribe({
      next: (consultations) => {
        this.consultations.set(consultations || []);
        this.loading.set(false);
      },
      error: (error: any) => {
        this.errorMessage.set(
          error?.error?.detail ||
            error?.message ||
            'Failed to load consultations',
        );
        console.error('Failed to load consultations:', error);
        this.loading.set(false);
      },
    });
  }

  viewConsultation(id: number) {
    this.router.navigate(['/patient/consultation', id]);
  }

  goBack() {
    this.router.navigate(['/patient/dashboard']);
  }

  createNewConsultation() {
    this.router.navigate(['/patient/consultation/new']);
  }

  formatDate(timestamp: string): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }

  getStatusClass(status: string): string {
    const baseClass = 'status-badge ';
    switch (status?.toLowerCase()) {
      case 'pending':
        return baseClass + 'status-pending';
      case 'active':
      case 'in_progress':
        return baseClass + 'status-active';
      case 'completed':
        return baseClass + 'status-completed';
      case 'cancelled':
        return baseClass + 'status-cancelled';
      default:
        return baseClass + 'status-pending';
    }
  }
}
