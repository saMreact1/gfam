import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegistrationResponse } from '../../pages/registration/registration';

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

@Injectable({
  providedIn: 'root'
})
export class Register {
  private api = 'https://api.graceforallmenministry.org/api/v1';

  constructor(private http: HttpClient) { }

  register(data: any) {
    return this.http.post<RegistrationResponse>(`${this.api}/registrations`, data);
  }

  sendOtp(registrationData: any) {
    return this.http.post<OtpResponse>(`${this.api}/registrations/send-otp`, registrationData);
  }

  verifyOtp(email: string, otpCode: string) {
    return this.http.post<VerifyOtpResponse>(`${this.api}/registrations/verify-otp`, { email, otpCode });
  }

  resendOtp(email: string) {
    return this.http.post<OtpResponse>(`${this.api}/registrations/resend-otp/${email}`, {});
  }

  getStates() {
    return this.http.get(`${this.api}/states`);
  }
}
