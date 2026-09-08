import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';

export interface EventRegistrationPageResponse {
  eventId: number;
  eventName: string;
  startDate: string;
  endDate: string;
  registrationOpen: boolean;
  maxCapacity: number;
  registeredCount: number;
  remainingCapacity: number;
  registrationPageUrl: string;
  registrationApiUrl: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  responseCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private api = 'https://api.graceforallmenministry.org/api/v1';
  private readonly currentEventKey = '72hours-2026';
  private currentEvent?: EventRegistrationPageResponse;
  private currentEventRequest$?: Observable<EventRegistrationPageResponse>;

  constructor(private http: HttpClient) {}

  getCurrentEvent(): Observable<EventRegistrationPageResponse> {
    if (this.currentEvent) {
      return of(this.currentEvent);
    }

    if (!this.currentEventRequest$) {
      this.currentEventRequest$ = this.http.get<ApiResponse<EventRegistrationPageResponse>>(
        `${this.api}/events/${this.currentEventKey}/registration-page`
      ).pipe(
        map(response => response.data),
        tap(event => this.currentEvent = event),
        catchError(error => {
          this.currentEventRequest$ = undefined;
          return throwError(() => error);
        }),
        shareReplay(1)
      );
    }

    return this.currentEventRequest$;
  }
}
