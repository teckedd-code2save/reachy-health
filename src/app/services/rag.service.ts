import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RagService {
  private apiUrl = `${environment.apiUrl}/rag`;

  constructor(private http: HttpClient) {}

  query(question: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/query`, { question });
  }

  addDocument(type: string, content: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add/${type}`, content);
  }
}
