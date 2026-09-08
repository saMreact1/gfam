import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

export interface AttendeeArchiveEventResponse {
  eventId: number;
  eventName: string;
  startDate: string;
  endDate: string;
  totalAttendees: number;
  checkedInAttendees: number;
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
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    // If search query is provided, use the search endpoint
    if (search && search.trim()) {
      url = `${this.api}/attendees/current/search`;
      params = params.set('query', search.trim());
      console.log('🔍 Searching attendees with query:', search);
    }
    // If status filter is applied, use the status endpoint
    else if (status && status !== 'all') {
      url = `${this.api}/attendees/current/status/${status}`;
      console.log('🏷️ Filtering by status:', status);
    }
    // Otherwise, get all attendees
    else {
      url = `${this.api}/attendees/current`;
      console.log('👥 Fetching all attendees');
    }

    console.log('📡 API URL:', url);

    return this.http.get<ApiResponse<PagedAttendeeResponse>>(
      url,
      { headers: this.getHeaders(), params }
    );
  }

  exportAttendees(): Observable<Blob> {
    const token = localStorage.getItem('adminToken');
    return this.http.get(`${this.api}/attendees/current/export`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'text/csv',
        'Authorization': `Bearer ${token}`
      })
    });
  }

  getArchiveEvents(): Observable<ApiResponse<AttendeeArchiveEventResponse[]>> {
    return this.http.get<ApiResponse<AttendeeArchiveEventResponse[]>>(
      `${this.api}/attendees/archive/events`,
      { headers: this.getHeaders() }
    );
  }

  getArchivedAttendees(
    eventId: number,
    page: number = 0,
    size: number = 20,
    search?: string
  ): Observable<ApiResponse<PagedAttendeeResponse>> {
    let params = new HttpParams()
      .set('eventId', eventId)
      .set('page', page)
      .set('size', size);

    if (search?.trim()) {
      params = params.set('query', search.trim());
      return this.http.get<ApiResponse<PagedAttendeeResponse>>(
        `${this.api}/attendees/archive/search`,
        { headers: this.getHeaders(), params }
      );
    }

    params = params.delete('eventId');
    return this.http.get<ApiResponse<PagedAttendeeResponse>>(
      `${this.api}/attendees/archive/event/${eventId}`,
      { headers: this.getHeaders(), params }
    );
  }

  exportArchivedAttendees(eventId: number): Observable<Blob> {
    const token = localStorage.getItem('adminToken');
    return this.http.get(`${this.api}/attendees/archive/event/${eventId}/export`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'text/csv',
        'Authorization': `Bearer ${token}`
      })
    });
  }
}
