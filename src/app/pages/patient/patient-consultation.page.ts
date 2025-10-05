import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VoiceInputComponent } from '../../components/voice-input.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-patient-consultation',
  standalone: true,
  imports: [CommonModule, VoiceInputComponent],
  templateUrl: './patient-consultation.page.html',
  styleUrl: './patient-consultation.page.css'
})
export class PatientConsultationPage {
  transcript = '';
  language = 'en';
  audioBlob: Blob | null = null;
  submitting = false;
  private apiUrl = environment.apiUrl;

  constructor(
    public router: Router,
    private http: HttpClient
  ) {}

  onTranscription(text: string) {
    this.transcript = text;
  }

  onAudioRecorded(blob: Blob) {
    this.audioBlob = blob;
  }

  async submitConsultation() {
    if (!this.transcript || !this.audioBlob) return;
    
    this.submitting = true;
    const formData = new FormData();
    formData.append('transcript', this.transcript);
    formData.append('language', this.language);
    formData.append('audio', this.audioBlob, 'consultation.webm');

    this.http.post(`${this.apiUrl}/consultations`, formData).subscribe({
      next: () => {
        this.router.navigate(['/patient/dashboard']);
      },
      error: (err) => {
        console.error('Submission failed:', err);
        this.submitting = false;
      }
    });
  }
}
