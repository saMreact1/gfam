import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminAuthService } from '../../../../core/services/admin-auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snack: MatSnackBar,
    private authService: AdminAuthService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) return;

    this.isLoading = true;
    const { email } = this.forgotPasswordForm.value;

    this.authService.forgotPassword({ email }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.responseCode === '00') {
          this.emailSent = true;
          this.snack.open(response.message || 'Password reset link sent to your email!', 'Close', { duration: 5000 });
        } else {
          this.snack.open(response.message || 'Failed to send reset link', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.snack.open('Failed to send reset link. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/admin/login']);
  }

  resendEmail() {
    this.emailSent = false;
    this.onSubmit();
  }
}

