import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  recording$ = new Subject<boolean>();
  audioBlob$ = new Subject<Blob>();
  error$ = new Subject<string>();

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioBlob$.next(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      this.mediaRecorder.start();
      this.recording$.next(true);
    } catch (error) {
      this.error$.next('Microphone access denied');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.recording$.next(false);
    }
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}
