import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CaseService {
  private http = inject(HttpClient);

  private apiUrl = 'http://0.0.0.0:8000/api/v1/cases';

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}

  getCases(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/`);
  }

  getCase(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createCase(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/`, data);
  }

  updateCase(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteCase(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
