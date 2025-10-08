import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface VerifyRequest {
  code: string;
}

export interface VerifyResponse {
  code: string;
  fullName: string;
  prayerColor: string;
  prayerTime: string;
  tagToIssue: string;
  coordinatorName: string;
  coordinatorPhone: string;
  verifiedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  responseCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class VerificationService {
  private api = 'https://api.graceforallmenministry.org/api/v1/registrations';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  verifyAttendee(code: string): Observable<ApiResponse<VerifyResponse>> {
    return this.http.post<ApiResponse<VerifyResponse>>(
      `${this.api}/verify`,
      { code },
      { headers: this.getHeaders() }
    );
  }
}

