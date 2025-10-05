import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VoiceInputComponent } from '../../components/voice-input.component';

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

  constructor(private router: Router) {}

  onTranscription(text: string) {
    this.transcript = text;
  }

  submitConsultation() {
    // TODO: Submit to backend
    console.log('Submitting consultation:', this.transcript);
    this.router.navigate(['/patient/dashboard']);
  }
}
