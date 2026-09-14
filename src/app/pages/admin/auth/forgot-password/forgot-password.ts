import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AdminAuthService } from '../../../../core/services/admin-auth.service';
import { AlertDialog, AlertDialogData } from '../../../../shared/components/alert-dialog';

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
    private dialog: MatDialog,
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
          this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'success', message: response.message || 'Password reset link sent to your email!' } as AlertDialogData });
        } else {
          this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'error', message: response.message || 'Failed to send reset link' } as AlertDialogData });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'error', message: 'Failed to send reset link. Please try again.' } as AlertDialogData });
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
