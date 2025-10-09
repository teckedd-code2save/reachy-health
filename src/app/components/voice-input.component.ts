import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceRecognitionService } from '../services/voice-recognition.service';
import { AudioRecordingService } from '../services/audio-recording.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-voice-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voice-input.component.html',
  styleUrl: './voice-input.component.css',
})
export class VoiceInputComponent implements OnInit, OnDestroy {
  @Input() language = 'en';
  @Output() transcription = new EventEmitter<string>();
  @Output() audioRecorded = new EventEmitter<Blob>();

  isListening = false;
  transcript = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private voiceRecognition: VoiceRecognitionService,
    private audioRecording: AudioRecordingService,
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.voiceRecognition.transcript$.subscribe((text) => {
        this.transcript = text;
      }),
      this.voiceRecognition.isListening$.subscribe((listening) => {
        this.isListening = listening;
      }),
      this.audioRecording.audioBlob$.subscribe((blob) => {
        this.audioRecorded.emit(blob);
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.stopRecording();
  }

  toggleListening() {
    if (this.isListening) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  private startRecording() {
    this.voiceRecognition.start(this.language);
    this.audioRecording.startRecording();
  }

  private stopRecording() {
    this.voiceRecognition.stop();
    this.audioRecording.stopRecording();
    if (this.transcript) {
      this.transcription.emit(this.transcript);
    }
  }
}
