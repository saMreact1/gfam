import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  responseCode: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface InviteUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface InviteUserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  active: boolean;
  invitedBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private api = 'https://api.graceforallmenministry.org/api/v1';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  login(data: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.api}/auth/login`, data);
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<ApiResponse<ForgotPasswordResponse>> {
    return this.http.post<ApiResponse<ForgotPasswordResponse>>(`${this.api}/auth/forgot-password`, data);
  }

  inviteUser(data: InviteUserRequest): Observable<ApiResponse<InviteUserResponse>> {
    return this.http.post<ApiResponse<InviteUserResponse>>(
      `${this.api}/users/invite`,
      data,
      { headers: this.getHeaders() }
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.api}/auth/change-password`,
      data,
      { headers: this.getHeaders() }
    );
  }

  getAllUsers(): Observable<ApiResponse<UserResponse[]>> {
    return this.http.get<ApiResponse<UserResponse[]>>(
      `${this.api}/users`,
      { headers: this.getHeaders() }
    );
  }

  getUserByEmail(email: string): Observable<ApiResponse<UserResponse>> {
    return this.http.get<ApiResponse<UserResponse>>(
      `${this.api}/users/${email}`,
      { headers: this.getHeaders() }
    );
  }

  deactivateUser(userId: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `${this.api}/users/${userId}`,
      { headers: this.getHeaders() }
    );
  }

  logout(): void {
    // Clear local storage or session storage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('adminToken');
  }

  getToken(): string | null {
    return localStorage.getItem('adminToken');
  }

  setToken(token: string): void {
    localStorage.setItem('adminToken', token);
  }

  setUser(user: LoginResponse): void {
    localStorage.setItem('adminUser', JSON.stringify(user));
  }

  getUser(): LoginResponse | null {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  }
}

