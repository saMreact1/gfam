import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RegistrationResponse } from '../../pages/registration/registration';
import { EventRegistrationPageResponse, EventService } from './event.service';

export interface OtpResponse {
  message: string;
  email: string;
  responseCode: string;
  expiresInMinutes: number;
}

export interface VerifyOtpResponse {
  responseCode: string;
  message: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  responseCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class Register {
  private api = 'https://api.graceforallmenministry.org/api/v1';

  constructor(
    private http: HttpClient,
    private eventService: EventService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken');
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders();
  }

  register(data: any, useAuth: boolean = false) {
    const headers = useAuth ? this.getHeaders() : new HttpHeaders();
    return this.http.post<RegistrationResponse>(`${this.api}/registrations`, data, { headers });
  }

  sendOtp(registrationData: any): Observable<OtpResponse> {
    return this.http.post<ApiResponse<OtpResponse>>(`${this.api}/registrations/send-otp`, registrationData).pipe(
      map(response => this.toOtpResponse(response, registrationData.email)),
      catchError((error: HttpErrorResponse) => {
        const body = error.error;
        if (body?.responseCode === 'REGISTRATION_IDENTITY_CONFLICT') {
          return of({
            message: body.message,
            email: registrationData.email,
            responseCode: body.responseCode,
            expiresInMinutes: 0
          });
        }
        return throwError(() => error);
      })
    );
  }

  verifyOtp(email: string, otpCode: string): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${this.api}/registrations/verify-otp`, { email, otpCode });
  }

  resendOtp(email: string): Observable<OtpResponse> {
    return this.http.post<ApiResponse<OtpResponse>>(`${this.api}/registrations/resend-otp/${email}`, {}).pipe(
      map(response => response.data)
    );
  }

  getStates() {
    return this.http.get(`${this.api}/states`);
  }

  getCurrentEvent(): Observable<EventRegistrationPageResponse> {
    return this.eventService.getCurrentEvent();
  }

  private toOtpResponse(response: ApiResponse<OtpResponse>, fallbackEmail: string): OtpResponse {
    if (response.data) {
      return response.data;
    }

    return {
      message: response.message,
      email: fallbackEmail,
      responseCode: response.responseCode,
      expiresInMinutes: 0
    };
  }
}
