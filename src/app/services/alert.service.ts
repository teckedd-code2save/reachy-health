import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private apiUrl = 'http://0.0.0.0:8000/api/v1/alerts';

  constructor(private http: HttpClient) {}

  getAlerts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/`);
  }

  getAlert(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createAlert(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/`, data);
  }

  updateAlert(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteAlert(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
