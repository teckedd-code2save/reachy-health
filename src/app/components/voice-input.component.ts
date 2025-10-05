import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-voice-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voice-input.component.html',
  styleUrl: './voice-input.component.css'
})
export class VoiceInputComponent {
  @Input() language = 'en';
  @Output() transcription = new EventEmitter<string>();
  
  isListening = false;
  transcript = '';

  toggleListening() {
    this.isListening = !this.isListening;
    if (this.isListening) {
      this.startRecording();
    } else {
      this.stopRecording();
    }
  }

  private startRecording() {
    // TODO: Implement Web Speech API or AWS Transcribe
    console.log('Recording started in', this.language);
  }

  private stopRecording() {
    console.log('Recording stopped');
    this.transcription.emit(this.transcript);
  }
}
