import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoiceRecognitionService {
  private recognition: any;
  private isListening = false;
  
  transcript$ = new Subject<string>();
  isListening$ = new Subject<boolean>();
  error$ = new Subject<string>();

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      
      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        this.transcript$.next(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this.error$.next(event.error);
        this.stop();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.isListening$.next(false);
      };
    }
  }

  start(language: string = 'en-US') {
    if (!this.recognition) {
      this.error$.next('Speech recognition not supported');
      return;
    }

    const langMap: { [key: string]: string } = {
      'en': 'en-US',
      'tw': 'tw-GH',
      'ga': 'ga-GH'
    };

    this.recognition.lang = langMap[language] || 'en-US';
    this.recognition.start();
    this.isListening = true;
    this.isListening$.next(true);
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.isListening$.next(false);
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }
}
