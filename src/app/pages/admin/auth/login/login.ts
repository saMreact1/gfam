import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AdminAuthService } from '../../../../core/services/admin-auth.service';
import { AlertDialog, AlertDialogData } from '../../../../shared/components/alert-dialog';

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
    private dialog: MatDialog,
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
        this.isLoading = false;
        if (response.responseCode === '00' && response.data) {
          this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'success', message: response.message || 'Login successful!' } as AlertDialogData });
          this.router.navigate(['/admin']);
        } else {
          this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'error', message: response.message || 'Login failed' } as AlertDialogData });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'error', message: 'Login failed. Please check your credentials.' } as AlertDialogData });
      }
    });
  }

  goToForgotPassword() {
    this.router.navigate(['/admin/forgot-password']);
  }
}
