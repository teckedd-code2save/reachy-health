import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VisitService {
  private apiUrl = 'http://0.0.0.0:8000/api/v1/visits';

  constructor(private http: HttpClient) {}

  getVisits(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/`);
  }

  getVisit(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createVisit(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/`, data);
  }

  updateVisit(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteVisit(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
