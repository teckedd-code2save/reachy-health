import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id: number;
  consultation_id: number;
  sender: 'patient' | 'doctor' | 'ai';
  message: string;
  message_type: 'text' | 'file' | 'audio';
  timestamp: string;
}

export interface MedicalEntities {
  symptoms: string[];
  diagnoses: string[];
  medications: string[];
}

export interface ConsultationSummary {
  consultation_id: number;
  summary: string;
  key_points: string[];
  medical_entities: MedicalEntities;
  sentiment: string;
  generated_at: string;
}

export interface FileAttachment {
  id?: number;
  filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConsultationService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/consultations`;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  getAll(status?: string): Observable<any[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http
      .get<any[]>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<any> {
    console.log('Fetching consultation with ID:', id);
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  create(formData: FormData): Observable<any> {
    return this.http
      .post<any>(this.apiUrl, formData)
      .pipe(catchError(this.handleError));
  }

  update(id: number, data: any): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  // Chat functionality
  addChatMessage(
    consultationId: number,
    message: {
      consultation_id: number;
      sender: string;
      message: string;
      message_type?: string;
    },
  ): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/${consultationId}/chat`, message)
      .pipe(catchError(this.handleError));
  }

  getChatMessages(consultationId: number): Observable<ChatMessage[]> {
    return this.http
      .get<ChatMessage[]>(`${this.apiUrl}/${consultationId}/chat`)
      .pipe(catchError(this.handleError));
  }

  // File upload functionality
  uploadFile(consultationId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<any>(`${this.apiUrl}/${consultationId}/files`, formData)
      .pipe(catchError(this.handleError));
  }

  getConsultationFiles(consultationId: number): Observable<FileAttachment[]> {
    return this.http
      .get<FileAttachment[]>(`${this.apiUrl}/${consultationId}/files`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('ConsultationService error:', error);
    return throwError(
      () => new Error(error.error?.detail || 'An error occurred'),
    );
  }

  /**
   * Generate AI-powered summary for a consultation
   */
  generateSummary(consultationId: number): Observable<ConsultationSummary> {
    return this.http
      .post<ConsultationSummary>(
        `${this.apiUrl}/consultations/${consultationId}/summary`,
        {},
      )
      .pipe(
        catchError((error) => {
          console.error('Failed to generate summary:', error);
          return throwError(() => error);
        }),
      );
  }

  /**
   * Get existing summary for a consultation
   */
  getSummary(consultationId: number): Observable<ConsultationSummary | null> {
    return this.http
      .get<ConsultationSummary>(
        `${this.apiUrl}/consultations/${consultationId}/summary`,
      )
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            return throwError(() => null);
          }
          console.error('Failed to get summary:', error);
          return throwError(() => error);
        }),
      );
  }

  /**
   * Export summary as PDF or TXT
   */
  exportSummary(
    consultationId: number,
    format: 'pdf' | 'txt' = 'pdf',
  ): Observable<Blob> {
    return this.http
      .get(
        `${this.apiUrl}/consultations/${consultationId}/summary/export?format=${format}`,
        { responseType: 'blob' },
      )
      .pipe(
        catchError((error) => {
          console.error('Failed to export summary:', error);
          return throwError(() => error);
        }),
      );
  }

  /**
   * Transcribe audio for a consultation using Whisper model
   */
  transcribeConsultation(consultationId: number): Observable<{
    message: string;
    transcript: string;
    consultation_id: number;
  }> {
    return this.http
      .post<{
        message: string;
        transcript: string;
        consultation_id: number;
      }>(`${this.apiUrl}/${consultationId}/transcribe`, {})
      .pipe(
        catchError((error) => {
          console.error('Failed to transcribe consultation:', error);
          return throwError(() => error);
        }),
      );
  }

  /**
   * Standalone transcription endpoint for audio files
   * Used for landing page voice transcription and language detection
   */
  transcribeAudio(
    audioFile: File,
    detectLanguage: boolean = false,
  ): Observable<{
    transcript: string;
    text: string;
    detected_language?: string;
  }> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('detect_language', detectLanguage.toString());

    return this.http
      .post<{
        transcript: string;
        text: string;
        detected_language?: string;
      }>(`${environment.apiUrl}/consultations/transcribe`, formData)
      .pipe(
        catchError((error) => {
          console.error('Failed to transcribe audio:', error);
          return throwError(() => error);
        }),
      );
  }
}
