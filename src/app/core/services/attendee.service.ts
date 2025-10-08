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
  REGISTERED = 'REGISTERED',
  CHECKED_IN = 'CHECKED_IN',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED',
  VIRTUAL = 'VIRTUAL'
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

export interface PageableResponse {
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface PagedAttendeeResponse {
  content: AttendeeResponse[];
  pageable: PageableResponse;
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  responseCode: string;
  success?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AttendeeService {
  private api = 'https://api.graceforallmenministry.org/api/v1';
  private eventId = 1; // Current event ID

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken');
    console.log('👥 Attendees - Token from localStorage:', token);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    console.log('👥 Attendees - Authorization header:', headers.get('Authorization'));
    return headers;
  }

  getAllAttendees(page: number = 0, size: number = 20, status?: string, search?: string): Observable<ApiResponse<PagedAttendeeResponse>> {
    let url: string;
    let params: string[];

    // If search query is provided, use the search endpoint
    if (search && search.trim()) {
      url = `${this.api}/attendees/search`;
      params = [
        `eventId=${this.eventId}`,
        `query=${encodeURIComponent(search.trim())}`,
        `page=${page}`,
        `size=${size}`
      ];
      console.log('🔍 Searching attendees with query:', search);
    }
    // If status filter is applied, use the status endpoint
    else if (status && status !== 'all') {
      url = `${this.api}/attendees/event/${this.eventId}/status/${status}`;
      params = [`page=${page}`, `size=${size}`];
      console.log('🏷️ Filtering by status:', status);
    }
    // Otherwise, get all attendees
    else {
      url = `${this.api}/attendees/event/${this.eventId}`;
      params = [`page=${page}`, `size=${size}`];
      console.log('👥 Fetching all attendees');
    }

    url += `?${params.join('&')}`;
    console.log('📡 API URL:', url);

    return this.http.get<ApiResponse<PagedAttendeeResponse>>(
      url,
      { headers: this.getHeaders() }
    );
  }

  exportAttendees(): Observable<Blob> {
    const token = localStorage.getItem('adminToken');
    return this.http.get(`${this.api}/attendees/event/${this.eventId}/export`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'text/csv',
        'Authorization': `Bearer ${token}`
      })
    });
  }

  getEventId(): number {
    return this.eventId;
  }
}

