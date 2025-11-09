import { Component, inject, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AudioRecordingService } from '../services/audio-recording.service';
import { ConsultationService } from '../services/consultation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.css',
})
export class LandingPage implements OnDestroy {
  private router = inject(Router);
  private audioRecording = inject(AudioRecordingService);
  private consultationService = inject(ConsultationService);

  selectedLanguage = signal('en');
  isRecording = signal(false);
  isTranscribing = signal(false);
  transcriptionText = signal('');
  transcriptionError = signal('');
  private subscriptions: Subscription[] = [];

  languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'tw', name: 'Twi', flag: '🇬🇭' },
    { code: 'ga', name: 'Ga', flag: '🇬🇭' },
  ];

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {
    // Subscribe to audio recording events
    this.subscriptions.push(
      this.audioRecording.recording$.subscribe((recording) => {
        this.isRecording.set(recording);
      }),
      this.audioRecording.audioBlob$.subscribe((blob) => {
        this.transcribeAudioForLanguageDetection(blob);
      }),
      this.audioRecording.error$.subscribe((error) => {
        this.transcriptionError.set(error);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.audioRecording.stopRecording();
  }

  onLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const lang = select.value;
    this.selectedLanguage.set(lang);
    console.log('Language changed to:', lang);
    // Here you can plug in i18n or ngx-translate logic
  }

  toggleVoiceRecording() {
    if (this.isRecording()) {
      this.audioRecording.stopRecording();
    } else {
      this.audioRecording.startRecording();
      this.transcriptionText.set('');
      this.transcriptionError.set('');
    }
  }

  async transcribeAudioForLanguageDetection(audioBlob: Blob) {
    this.isTranscribing.set(true);
    this.transcriptionError.set('');

    try {
      // Convert Blob to File for the API
      const audioFile = new File([audioBlob], 'voice-recording.webm', {
        type: 'audio/webm',
      });

      // Send to transcription endpoint with language detection
      this.consultationService.transcribeAudio(audioFile, true).subscribe({
        next: (result) => {
          this.transcriptionText.set(result.transcript);
          
          // If language was detected, update the language selector
          if (result.detected_language) {
            const detectedLang = result.detected_language.toLowerCase();
            if (this.languages.find((l) => l.code === detectedLang)) {
              this.selectedLanguage.set(detectedLang);
              // Update the select element
              const select = document.getElementById('language') as HTMLSelectElement;
              if (select) {
                select.value = detectedLang;
              }
            }
          }
          
          this.isTranscribing.set(false);
        },
        error: (error: any) => {
          this.transcriptionError.set(
            error?.error?.detail ||
              error?.message ||
              'Failed to transcribe audio. Please try again.'
          );
          console.error('Transcription error:', error);
          this.isTranscribing.set(false);
        },
      });
    } catch (error: any) {
      this.transcriptionError.set('Failed to process audio recording');
      console.error('Audio processing error:', error);
      this.isTranscribing.set(false);
    }
  }

  navigateToRole(role: 'patient' | 'doctor') {
    this.router.navigate([`/${role}/dashboard`]);
  }
}
