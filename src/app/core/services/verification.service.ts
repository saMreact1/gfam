import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface VerifyRequest {
  code: string;
}

export interface VerifyResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  prayerSlot: string;
  role: string;
  gender: string;
  registrationStatus: string;
  code: string;
  verifiedBy?: string;
  verifiedAt?: string;
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

  verifyAttendee(code: string): Observable<ApiResponse<VerifyResponse>> {
    return this.http.post<ApiResponse<VerifyResponse>>(`${this.api}/verify`, { code });
  }
}

