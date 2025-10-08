import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminAuthService } from '../../../../core/services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class AdminLogin {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snack: MatSnackBar,
    private authService: AdminAuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        console.log('🔐 Login response:', response);
        this.isLoading = false;
        if (response.responseCode === '00' && response.data) {
          // Store JWT token and user data
          console.log('💾 Storing token:', response.data.token);
          this.authService.setToken(response.data.token);
          this.authService.setUser(response.data);
          console.log('✅ Token stored in localStorage:', localStorage.getItem('adminToken'));

          this.snack.open(response.message || 'Login successful!', 'Close', { duration: 3000 });
          this.router.navigate(['/admin']);
        } else {
          this.snack.open(response.message || 'Login failed', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        console.error('❌ Login error:', err);
        this.isLoading = false;
        this.snack.open('Login failed. Please check your credentials.', 'Close', { duration: 3000 });
      }
    });
  }

  goToForgotPassword() {
    this.router.navigate(['/admin/forgot-password']);
  }
}

