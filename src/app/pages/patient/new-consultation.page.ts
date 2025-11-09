import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VoiceInputComponent } from '../../components/voice-input.component';
import { ConsultationService } from '../../services/consultation.service';

@Component({
  selector: 'app-new-consultation',
  standalone: true,
  imports: [CommonModule, FormsModule, VoiceInputComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <!-- Header -->
      <header class="bg-white/70 backdrop-blur-md shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
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
              <h1 class="text-2xl md:text-3xl font-semibold text-blue-600">
                New Consultation
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-3xl mx-auto px-4 py-10">
        <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h2 class="text-xl md:text-2xl font-semibold text-gray-900 mb-6">
            Describe Your Symptoms
          </h2>

          <!-- Voice Input Section -->
          <div class="mb-10">
            <app-voice-input
              [language]="language()"
              (transcription)="onTranscription($event)"
              (audioRecorded)="onAudioRecorded($event)"
            >
            </app-voice-input>
          </div>

          <!-- Transcript Display -->
          @if (transcript()) {
            <div class="mb-10">
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Your Description:</label
              >
              <div
                class="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200"
              >
                <p class="text-gray-800">{{ transcript() }}</p>
              </div>
            </div>
          }

          <!-- File Upload Section -->
          <div class="mb-10">
            <label class="block text-sm font-medium text-gray-900 mb-3">Upload Medical Files (Optional)</label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              (click)="fileInput.click()"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
            >
              <input
                type="file"
                #fileInput
                (change)="onFileSelected($event)"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                class="hidden"
              />
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <p class="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
              <p class="text-xs text-gray-500 mt-1">PDF, Images, Documents (Max 10MB each)</p>
            </div>

            <!-- Selected Files -->
            @if (selectedFiles().length > 0) {
              <div class="mt-4 space-y-2">
                @for (file of selectedFiles(); track file.name) {
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center">
                      <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span class="text-sm text-gray-700">{{ file.name }}</span>
                      <span class="text-xs text-gray-500 ml-2">({{ formatFileSize(file.size) }})</span>
                    </div>
                    <button (click)="removeFile(file)" class="text-red-600 hover:text-red-800 text-sm font-medium">
                      Remove
                    </button>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Error Message -->
          @if (errorMessage()) {
            <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex">
                <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="flex-1">
                  <p class="text-sm text-red-700">{{ errorMessage() }}</p>
                </div>
                <button (click)="errorMessage.set('')" class="text-red-600 hover:text-red-800">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          }

          <!-- Submit Button -->
          <button
            (click)="submitConsultation()"
            [disabled]="submitting() || !transcript()"
            class="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center text-lg font-medium shadow-md hover:shadow-lg"
          >
            @if (submitting()) {
              <svg class="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            } @else {
              Start Consultation
            }
          </button>

          <!-- Tips -->
          <div
            class="mt-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100"
          >
            <h4 class="font-medium text-gray-900 mb-2">💡 Tips for better results:</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Speak clearly and describe your symptoms in detail</li>
              <li>• Mention when symptoms started and their severity</li>
              <li>• Include any relevant medical history</li>
              <li>• Upload any test results or relevant documents</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .drag-over {
        border-color: #3b82f6 !important;
        background-color: #eff6ff !important;
      }
    `,
  ],
})
export class NewConsultationPage {
  private router = inject(Router);
  private consultationService = inject(ConsultationService);

  transcript = signal('');
  language = signal('en');
  audioBlob = signal<Blob | null>(null);
  selectedFiles = signal<File[]>([]);
  submitting = signal(false);
  errorMessage = signal('');

  goBack() {
    this.router.navigate(['/patient/dashboard']);
  }

  onTranscription(text: string) {
    this.transcript.set(text);
  }

  onAudioRecorded(blob: Blob) {
    this.audioBlob.set(blob);
  }

  onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles.update((current) => [...current, ...files]);
    event.target.value = '';
  }

  removeFile(file: File) {
    this.selectedFiles.update((current) => current.filter((f) => f !== file));
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).classList.add('drag-over');
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).classList.remove('drag-over');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).classList.remove('drag-over');
    const files = Array.from(event.dataTransfer?.files || []);
    this.selectedFiles.update((current) => [...current, ...files]);
  }

  submitConsultation() {
    if (!this.transcript()) {
      this.errorMessage.set('Please provide a description of your symptoms');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const formData = new FormData();
    formData.append('transcript', this.transcript());
    formData.append('language', this.language());

    const blob = this.audioBlob();
    if (blob) {
      formData.append('audio', blob, 'consultation.webm');
    }

    for (const file of this.selectedFiles()) {
      formData.append('files', file);
    }

    this.consultationService.create(formData).subscribe({
      next: (consultation) => {
        if (consultation) {
          this.router.navigate(['/patient/consultation', consultation.id]);
        }
      },
      error: (error: any) => {
        this.errorMessage.set(
          error?.error?.detail || error?.message || 'Failed to submit consultation',
        );
        console.error('Submission failed:', error);
        this.submitting.set(false);
      },
    });
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}