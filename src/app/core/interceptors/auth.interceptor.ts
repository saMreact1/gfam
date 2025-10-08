import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('adminToken');

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
      // Handle 401 Unauthorized errors (but not for login/forgot-password endpoints)
      const isAuthEndpoint = req.url.includes('/auth/login') ||
                             req.url.includes('/auth/forgot-password') ||
                             req.url.includes('/registrations');

      if (error.status === 401 && !isAuthEndpoint) {
        localStorage.clear();
        router.navigate(['/admin/login']);
      }
      return throwError(() => error);
    })
  );
};

