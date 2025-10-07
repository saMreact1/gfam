import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface DashboardStatsResponse {
  totalRegistered: number;
  attended: number;
  pending: number;
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

  getDashboardStats(): Observable<ApiResponse<DashboardStatsResponse>> {
    return this.http.get<ApiResponse<DashboardStatsResponse>>(`${this.api}/dashboard/stats/${this.eventId}`);
  }

  getEventId(): number {
    return this.eventId;
  }
}

