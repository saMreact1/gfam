import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { EventRegistrationPageResponse, EventService } from './event.service';

export interface CheckInRequest {
  barcode?: string;
  code?: string;
}

export interface CheckInResponse {
  registrationId: number;
  eventId: number;
  code: string;
  fullName: string;
  phone: string;
  gender: string;
  prayerColor: string | null;
  prayerTime: string | null;
  accommodationType: string | null;
  tagToIssue: string | null;
  coordinatorName: string | null;
  coordinatorPhone: string | null;
  status: string;
  alreadyCheckedIn: boolean;
  checkInDate: string | null;
  verifiedAt: string | null;
}

export interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message: string;
  responseCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class CheckInService {
  private api = 'https://api.graceforallmenministry.org/api/v1';
  private currentEvent?: EventRegistrationPageResponse;

  constructor(
    private http: HttpClient,
    private eventService: EventService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  scanRegistration(payload: CheckInRequest): Observable<ApiResponse<CheckInResponse>> {
    return this.getCurrentEvent().pipe(
      switchMap(event => this.http.post<ApiResponse<CheckInResponse>>(
        `${this.api}/admin/events/${event.eventId}/check-ins/scan`,
        payload,
        { headers: this.getHeaders() }
      ))
    );
  }

  getCurrentEvent(): Observable<EventRegistrationPageResponse> {
    return this.eventService.getCurrentEvent().pipe(
      tap(event => this.currentEvent = event)
    );
  }

  getEventId(): number | null {
    return this.currentEvent?.eventId ?? null;
  }

  getEventName(): string {
    return this.currentEvent?.eventName ?? '72 Hours Registration 2026';
  }
}
