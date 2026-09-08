import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
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
  private readonly tokenKey = 'adminToken';
  private readonly refreshTokenKey = 'adminRefreshToken';
  private readonly userKey = 'adminUser';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  login(data: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.api}/auth/login`, data).pipe(
      tap(response => {
        if (response.responseCode === '00' && response.data) {
          this.setSession(response.data);
        }
      })
    );
  }

  refreshAccessToken(): Observable<ApiResponse<LoginResponse>> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<ApiResponse<LoginResponse>>(`${this.api}/auth/refresh`, { refreshToken }).pipe(
      tap(response => {
        if (response.responseCode === '00' && response.data) {
          this.setSession(response.data);
        }
      })
    );
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
    this.clearSession();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  setUser(user: LoginResponse): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser(): LoginResponse | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  setSession(auth: LoginResponse): void {
    this.setToken(auth.token);
    if (auth.refreshToken) {
      this.setRefreshToken(auth.refreshToken);
    }
    this.setUser(auth);
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }
}
