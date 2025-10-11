import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id?: number;
  sender: string;
  message: string;
  message_type: string;
  timestamp: string;
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
    message: {consultation_id:number, sender: string; message: string; message_type?: string },
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
}
