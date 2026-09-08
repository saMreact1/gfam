import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { EventService } from './event.service';

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

  constructor(
    private http: HttpClient,
    private eventService: EventService
  ) { }

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
    return this.eventService.getCurrentEvent().pipe(
      switchMap(event => this.http.get<ApiResponse<DashboardStatsResponse>>(
        `${this.api}/dashboard/stats/${event.eventId}`,
        { headers: this.getHeaders() }
      ))
    );
  }
}
