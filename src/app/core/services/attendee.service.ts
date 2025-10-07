import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export enum MinisterRole {
  PASTOR = 'PASTOR',
  MINISTER = 'MINISTER',
  DEACON = 'DEACON',
  ELDER = 'ELDER',
  MEMBER = 'MEMBER'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CHECKED_IN = 'CHECKED_IN',
  REJECTED = 'REJECTED'
}

export interface AttendeeResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  prayerSlot: string;
  role: MinisterRole;
  gender: Gender;
  tagStatus: RegistrationStatus;
  code: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  responseCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendeeService {
  private api = 'https://api.graceforallmenministry.org/api/v1';
  private eventId = 1; // Current event ID

  constructor(private http: HttpClient) { }

  getAllAttendees(): Observable<ApiResponse<AttendeeResponse[]>> {
    return this.http.get<ApiResponse<AttendeeResponse[]>>(`${this.api}/event/${this.eventId}/attendees`);
  }

  exportAttendees(): Observable<Blob> {
    return this.http.get(`${this.api}/event/${this.eventId}/export`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'text/csv'
      })
    });
  }

  getEventId(): number {
    return this.eventId;
  }
}

