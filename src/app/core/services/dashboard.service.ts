import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface DashboardStatsResponse {
  totalRegistered: number;
  attended: number;
  pending: number;
  virtual: number;
  registrationsOverTime: { [key: string]: number };
  attendeesByRole: { [key: string]: number };
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  responseCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private api = 'https://api.graceforallmenministry.org/api/v1';
  private eventId = 1; // Current event ID

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken');
    console.log('🔑 Token from localStorage:', token);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    console.log('📤 Headers being sent:', headers.get('Authorization'));
    return headers;
  }

  getDashboardStats(): Observable<ApiResponse<DashboardStatsResponse>> {
    const url = `${this.api}/dashboard/stats/${this.eventId}`;
    console.log('📊 Fetching dashboard stats from:', url);
    console.log('📋 Headers:', this.getHeaders());
    return this.http.get<ApiResponse<DashboardStatsResponse>>(
      url,
      { headers: this.getHeaders() }
    );
  }

  getEventId(): number {
    return this.eventId;
  }
}

