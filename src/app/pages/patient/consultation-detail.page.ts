import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  signal,
  computed,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ConsultationService,
  ChatMessage,
} from '../../services/consultation.service';
import { interval, Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-consultation-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
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
              <div>
                <h1 class="text-2xl font-bold text-gray-900">
                  Consultation #{{ consultationId() }}
                </h1>
                @if (consultation()) {
                  <p class="text-sm text-gray-600">
                    Created {{ formatDate(consultation().created_at) }}
                  </p>
                }
              </div>
            </div>
            @if (consultation()) {
              <span [class]="getStatusClass(consultation().status)">
                {{ consultation().status }}
              </span>
            }
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
                (click)="loadConsultation()"
                class="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        }

        @if (consultation() && !loading()) {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column - Chat -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <!-- Chat Header -->
                <div class="p-4 border-b bg-gray-50">
                  <h3 class="text-lg font-semibold text-gray-900">
                    Conversation
                  </h3>
                </div>

                <!-- Chat Messages -->
                <div class="h-96 overflow-y-auto p-4 space-y-4" #chatContainer>
                  @for (message of chatMessages(); track message.id) {
                    <div
                      [class]="
                        message.sender === 'patient'
                          ? 'flex justify-end'
                          : 'flex justify-start'
                      "
                    >
                      <div
                        [class]="
                          message.sender === 'patient'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        "
                        class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
                      >
                        <p class="text-sm">{{ message.message }}</p>
                        <p class="text-xs mt-1 opacity-75">
                          {{ formatTime(message.timestamp) }}
                        </p>
                      </div>
                    </div>
                  }
                  @if (chatMessages().length === 0) {
                    <div class="text-center text-gray-500 py-8">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  }
                </div>

                <!-- Chat Input -->
                <div class="p-4 border-t bg-gray-50">
                  <div class="flex space-x-3">
                    <input
                      type="text"
                      [(ngModel)]="newMessageText"
                      (keyup.enter)="sendMessage()"
                      placeholder="Type your message..."
                      class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      (click)="sendMessage()"
                      [disabled]="!newMessageText.trim() || sendingMessage()"
                      class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      @if (sendingMessage()) {
                        <svg
                          class="animate-spin h-5 w-5"
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
                      } @else {
                        Send
                      }
                    </button>
                  </div>

                  <!-- File Upload -->
                  <div class="mt-3">
                    <input
                      type="file"
                      #fileInput
                      (change)="onFileSelected($event)"
                      class="hidden"
                    />
                    <button
                      (click)="fileInput.click()"
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    >
                      <svg
                        class="w-4 h-4 mr-1"
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
                      Attach File
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column - Details -->
            <div class="space-y-6">
              <!-- Consultation Details -->
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  Details
                </h3>
                <div class="space-y-3">
                  <div>
                    <span class="text-sm font-medium text-gray-700"
                      >Status:</span
                    >
                    <span
                      [class]="getStatusClass(consultation().status)"
                      class="ml-2"
                    >
                      {{ consultation().status }}
                    </span>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-700"
                      >Language:</span
                    >
                    <span class="text-sm text-gray-600 ml-2">{{
                      consultation().language?.toUpperCase()
                    }}</span>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-700"
                      >Created:</span
                    >
                    <span class="text-sm text-gray-600 ml-2">{{
                      formatDateTime(consultation().created_at)
                    }}</span>
                  </div>
                  @if (
                    consultation().updated_at !== consultation().created_at
                  ) {
                    <div>
                      <span class="text-sm font-medium text-gray-700"
                        >Updated:</span
                      >
                      <span class="text-sm text-gray-600 ml-2">{{
                        formatDateTime(consultation().updated_at)
                      }}</span>
                    </div>
                  }
                </div>

                @if (consultation().transcript) {
                  <div class="mt-4 pt-4 border-t">
                    <span class="text-sm font-medium text-gray-700 block mb-2"
                      >Original Description:</span
                    >
                    <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {{ consultation().transcript }}
                    </p>
                  </div>
                }

                @if (consultation().audio_url) {
                  <div class="mt-4 pt-4 border-t">
                    <span class="text-sm font-medium text-gray-700 block mb-2"
                      >Audio Recording:</span
                    >
                    <audio controls class="w-full">
                      <source
                        [src]="consultation().audio_url"
                        type="audio/webm"
                      />
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                }
              </div>

              <!-- Uploaded Files -->
              @if (
                consultation().file_attachments &&
                consultation().file_attachments.length > 0
              ) {
                <div class="bg-white rounded-lg shadow-md p-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    Files ({{ consultation().file_attachments.length }})
                  </h3>
                  <div class="space-y-3">
                    @for (
                      file of consultation().file_attachments;
                      track file.id
                    ) {
                      <div
                        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div class="flex items-center min-w-0 flex-1">
                          <svg
                            class="w-5 h-5 text-gray-500 mr-2 flex-shrink-0"
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
                          <div class="min-w-0 flex-1">
                            <p
                              class="text-sm font-medium text-gray-900 truncate"
                            >
                              {{ file.filename }}
                            </p>
                            <p class="text-xs text-gray-500">
                              {{ formatFileSize(file.file_size) }}
                            </p>
                          </div>
                        </div>
                        <a
                          [href]="file.file_url"
                          target="_blank"
                          class="ml-3 text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0"
                        >
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
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Quick Actions -->
              <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  Actions
                </h3>
                <div class="space-y-3">
                  <button
                    (click)="refreshConsultation()"
                    class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
                  >
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh
                  </button>
                  <button
                    (click)="goBack()"
                    class="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Back to List
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [
    `
      .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: capitalize;
        display: inline-block;
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
export class ConsultationDetailPage implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;

  // Signals
  consultationId = signal<number | null>(null);
  consultation = signal<any>(null);
  chatMessages = signal<ChatMessage[]>([]);
  sendingMessage = signal(false);
  loading = signal(false);
  errorMessage = signal('');

  // Regular property for two-way binding
  newMessageText = '';

  // Computed signals
  messageCount = computed(() => this.chatMessages().length);
  hasFiles = computed(() => {
    const cons = this.consultation();
    return cons?.file_attachments && cons.file_attachments.length > 0;
  });

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private consultationService: ConsultationService,
  ) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['id']) {
        this.consultationId.set(+params['id']);
        this.loadConsultation();
        this.startChatPolling();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack() {
    this.router.navigate(['/patient/consultations']);
  }

  loadConsultation() {
    const id = this.consultationId();
    if (!id) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.consultationService.getById(id).subscribe({
      next: (consultation) => {
        if (consultation) {
          this.consultation.set(consultation);
          this.loadChatMessages();
        } else {
          this.errorMessage.set('Consultation not found');
        }
        this.loading.set(false);
      },
      error: (error: any) => {
        this.errorMessage.set(
          error?.error?.detail ||
            error?.message ||
            'Failed to load consultation',
        );
        console.error('Failed to load consultation:', error);
        this.loading.set(false);
      },
    });
  }

  loadChatMessages() {
    const id = this.consultationId();
    if (!id) return;

    this.consultationService.getChatMessages(id).subscribe({
      next: (messages) => {
        this.chatMessages.set(messages || []);
        this.scrollToBottom();
      },
      error: (error: any) => {
        console.error('Failed to load chat messages:', error);
        this.chatMessages.set([]);
      },
    });
  }

  sendMessage() {
    if (!this.newMessageText.trim()) return;

    const id = this.consultationId();
    if (!id) return;

    this.sendingMessage.set(true);
    this.errorMessage.set('');

    this.consultationService
      .addChatMessage(id, {
        sender: 'patient',
        message: this.newMessageText.trim(),
        message_type: 'text',
      })
      .subscribe({
        next: (message) => {
          if (message) {
            this.newMessageText = '';
            this.loadChatMessages();
          }
          this.sendingMessage.set(false);
        },
        error: (error: any) => {
          this.errorMessage.set(
            error?.error?.detail || error?.message || 'Failed to send message',
          );
          console.error('Failed to send message:', error);
          this.sendingMessage.set(false);
        },
      });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    const id = this.consultationId();
    if (!file || !id) return;

    this.consultationService.uploadFile(id, file).subscribe({
      next: () => {
        this.loadConsultation();
        event.target.value = '';
      },
      error: (error: any) => {
        this.errorMessage.set(
          error?.error?.detail || error?.message || 'Failed to upload file',
        );
        console.error('Failed to upload file:', error);
      },
    });
  }

  private startChatPolling() {
    const id = this.consultationId();
    if (!id) return;

    interval(5000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.consultationService.getChatMessages(id)),
      )
      .subscribe({
        next: (messages) => {
          if (messages && messages.length !== this.chatMessages().length) {
            this.chatMessages.set(messages);
            this.scrollToBottom();
          }
        },
        error: (error) => console.error('Chat polling error:', error),
      });
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  refreshConsultation() {
    this.loadConsultation();
  }

  formatTime(timestamp: string): string {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
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
      year: 'numeric',
    });
  }

  formatDateTime(timestamp: string): string {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
