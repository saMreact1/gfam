import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
      map(response => response.data)
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
}
