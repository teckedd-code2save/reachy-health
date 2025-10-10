import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RagService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/rag`;

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  query(question: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/query`, { question });
  }

  addDocument(type: string, content: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add/${type}`, content);
  }
}
