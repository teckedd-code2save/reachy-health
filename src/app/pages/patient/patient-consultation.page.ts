import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoiceInputComponent } from '../../components/voice-input.component';
import { HttpClient } from '@angular/common/http';
import {
  ConsultationService,
  ChatMessage,
  FileAttachment,
} from '../../services/consultation.service';
import { environment } from '../../../environments/environment';
import { interval, Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-patient-consultation',
  standalone: true,
  imports: [CommonModule, FormsModule, VoiceInputComponent],
  templateUrl: './patient-consultation.page.html',
  styleUrl: './patient-consultation.page.css',
})
export class PatientConsultationPage implements OnInit, OnDestroy {
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private consultationService = inject(ConsultationService);

  @ViewChild('chatFileInput') chatFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;

  // Consultation data
  consultation: any = null;
  consultations: any[] = [];

  consultationId: number | null = null;

  // Voice input
  transcript = '';
  language = 'en';
  audioBlob: Blob | null = null;

  // File upload
  selectedFiles: File[] = [];

  // Chat
  chatMessages: ChatMessage[] = [];
  newMessage = '';
  sendingMessage = false;

  // UI state
  submitting = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  ngOnInit() {
    // Check if we have a consultation ID in the route
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['id']) {
        this.consultationId = +params['id'];
        this.loadConsultation();
        this.startChatPolling();
      } else {
        // Load all consultations if no specific ID
        this.loadConsultations();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Navigation
  goBack() {
    this.router.navigate(['/patient/dashboard']);
  }

  // Voice input handlers
  onTranscription(text: string) {
    this.transcript = text;
  }

  onAudioRecorded(blob: Blob) {
    this.audioBlob = blob;
  }

  // File upload handlers
  onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles.push(...files);

    // Clear the input
    event.target.value = '';
  }

  onChatFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    files.forEach((file) => {
      this.uploadChatFile(file);
    });

    // Clear the input
    event.target.value = '';
  }

  removeFile(file: File) {
    this.selectedFiles = this.selectedFiles.filter((f) => f !== file);
  }

  // Consultation management
  async submitConsultation() {
    if (!this.transcript && this.selectedFiles.length === 0) {
      this.errorMessage = 'Please provide a transcript or upload files';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    try {
      const formData = new FormData();
      formData.append('transcript', this.transcript);
      formData.append('language', this.language);

      if (this.audioBlob) {
        formData.append('audio', this.audioBlob, 'consultation.webm');
      }

      // Upload selected files
      for (const file of this.selectedFiles) {
        formData.append('files', file);
      }

      const consultation = await this.consultationService
        .create(formData)
        .toPromise();

      if (consultation) {
        this.consultation = consultation;
        this.consultationId = consultation.id;

        // Start polling for chat messages
        this.startChatPolling();

        // Clear form
        this.transcript = '';
        this.selectedFiles = [];
        this.audioBlob = null;

        // Navigate to the consultation page with ID
        this.router.navigate(['/patient/consultation', consultation.id]);
      }
    } catch (error: any) {
      this.errorMessage =
        error?.error?.detail ||
        error?.message ||
        'Failed to submit consultation';
      console.error('Submission failed:', error);
    } finally {
      this.submitting = false;
    }
  }

  private async loadConsultation() {
    if (!this.consultationId) return;

    try {
      const consultation = await this.consultationService
        .getById(this.consultationId)
        .toPromise();

      if (consultation) {
        this.consultation = consultation;
        await this.loadChatMessages();
      } else {
        this.errorMessage = 'Consultation not found';
      }
    } catch (error: any) {
      this.errorMessage =
        error?.error?.detail || error?.message || 'Failed to load consultation';
      console.error('Failed to load consultation:', error);
    }
  }

  private async loadConsultations() {
    try {
      const consultations = await this.consultationService.getAll().toPromise();

      if (consultations) {
        this.consultations = consultations;

        // If we have consultations but no specific one selected, show the most recent
        if (consultations.length > 0 && !this.consultationId) {
          this.consultation = consultations[0];
          this.consultationId = consultations[0].id;
          await this.loadChatMessages();
          this.startChatPolling();
        }
      }
    } catch (error: any) {
      this.errorMessage =
        error?.error?.detail ||
        error?.message ||
        'Failed to load consultations';
      console.error('Failed to load consultations:', error);
    }
  }

  // Chat functionality
  async sendMessage() {
    if (!this.newMessage.trim() || !this.consultationId) {
      return;
    }

    this.sendingMessage = true;
    this.errorMessage = '';

    try {
      const message = await this.consultationService
        .addChatMessage(this.consultationId, {
          sender: 'patient',
          message: this.newMessage.trim(),
          message_type: 'text',
        })
        .toPromise();

      if (message) {
        this.newMessage = '';
        await this.loadChatMessages();
      }
    } catch (error: any) {
      this.errorMessage =
        error?.error?.detail || error?.message || 'Failed to send message';
      console.error('Failed to send message:', error);
    } finally {
      this.sendingMessage = false;
    }
  }

  private async loadChatMessages() {
    if (!this.consultationId) return;

    try {
      const messages = await this.consultationService
        .getChatMessages(this.consultationId)
        .toPromise();

      if (messages) {
        this.chatMessages = messages;
        this.scrollToBottom();
      } else {
        this.chatMessages = [];
      }
    } catch (error: any) {
      console.error('Failed to load chat messages:', error);
      // Don't set error message here as it's a background operation
      this.chatMessages = [];
    }
  }

  private startChatPolling() {
    if (!this.consultationId) return;

    // Stop any existing polling
    this.destroy$.next();

    interval(5000) // Poll every 5 seconds
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() =>
          this.consultationService.getChatMessages(this.consultationId!),
        ),
      )
      .subscribe({
        next: (messages) => {
          if (messages && messages.length !== this.chatMessages.length) {
            this.chatMessages = messages;
            this.scrollToBottom();
          }
        },
        error: (error) => {
          console.error('Chat polling error:', error);
        },
      });
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      } else {
        // Fallback to getElementById
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }
    }, 100);
  }

  // File upload helpers
  private async uploadChatFile(file: File) {
    if (!this.consultationId) {
      this.errorMessage = 'No active consultation';
      return;
    }

    try {
      const result = await this.consultationService
        .uploadFile(this.consultationId, file)
        .toPromise();

      if (result) {
        await this.loadConsultation(); // Refresh to show new file
      }
    } catch (error: any) {
      this.errorMessage =
        error?.error?.detail || error?.message || 'Failed to upload file';
      console.error('Failed to upload chat file:', error);
    }
  }

  // Utility functions
  formatTime(timestamp: string): string {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDate(timestamp: string): string {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString();
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatFileSizeForDisplay(bytes: number): string {
    return this.formatFileSize(bytes);
  }

  // Drag and drop handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.classList.remove('drag-over');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;
    target.classList.remove('drag-over');

    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length > 0) {
      this.selectedFiles.push(...files);
    }
  }

  // Additional helper methods
  refreshConsultation() {
    if (this.consultationId) {
      this.loadConsultation();
    } else {
      this.loadConsultations();
    }
  }

  triggerChatFileInput() {
    if (this.chatFileInput) {
      this.chatFileInput.nativeElement.click();
    }
  }

  // Get status badge class
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'active':
      case 'in_progress':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }
}
