import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

export const authGuard = () => {
  const authService = inject(AdminAuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/admin/login']);
  return false;
};

export const adminGuard = () => {
  const authService = inject(AdminAuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/admin/login']);
    return false;
  }

  const user = authService.getUser();
  if (user?.role === 'ADMIN') {
    return true;
  }

  router.navigate(['/admin']);
  return false;
};

