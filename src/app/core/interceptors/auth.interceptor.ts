import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { AdminAuthService, ApiResponse, LoginResponse } from '../services/admin-auth.service';

let refreshRequest$: Observable<ApiResponse<LoginResponse>> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AdminAuthService);
  const token = authService.getToken();

  // Clone request and add authorization header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      const isAuthEndpoint = req.url.includes('/auth/login') ||
                             req.url.includes('/auth/refresh') ||
                             req.url.includes('/auth/logout') ||
                             req.url.includes('/auth/forgot-password') ||
                             req.url.includes('/auth/reset-password') ||
                             req.url.includes('/registrations');

      if (error.status === 401 && !isAuthEndpoint) {
        const refreshToken = authService.getRefreshToken();
        if (!refreshToken) {
          authService.clearSession();
          router.navigate(['/admin/login']);
          return throwError(() => error);
        }

        if (!refreshRequest$) {
          refreshRequest$ = authService.refreshAccessToken().pipe(
            finalize(() => refreshRequest$ = null),
            shareReplay(1)
          );
        }

        return refreshRequest$.pipe(
          switchMap((response) => {
            const nextToken = response.data?.token;
            if (!nextToken) {
              authService.clearSession();
              router.navigate(['/admin/login']);
              return throwError(() => error);
            }

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${nextToken}`
              }
            });

            return next(retryReq);
          }),
          catchError((refreshError) => {
            authService.clearSession();
            router.navigate(['/admin/login']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
