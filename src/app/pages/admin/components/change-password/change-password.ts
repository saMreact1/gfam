import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminAuthService } from '../../../../core/services/admin-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.scss']
})
export class ChangePassword {
  changePasswordForm: FormGroup;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AdminAuthService,
    private snack: MatSnackBar,
    private router: Router
  ) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.changePasswordForm.invalid) {
      this.snack.open('Please fill all fields correctly', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const { currentPassword, newPassword } = this.changePasswordForm.value;

    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.responseCode === '00') {
          this.snack.open('Password changed successfully! Please login again.', 'Close', { 
            duration: 4000,
            panelClass: ['success-snackbar']
          });
          
          // Logout and redirect to login after 2 seconds
          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/admin/login']);
          }, 2000);
        } else {
          this.snack.open(response.message || 'Failed to change password', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err.error?.message || 'Current password is incorrect';
        this.snack.open(errorMessage, 'Close', { duration: 3000 });
      }
    });
  }

  getErrorMessage(field: string): string {
    const control = this.changePasswordForm.get(field);
    
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    
    if (field === 'currentPassword' && control?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    
    if (field === 'newPassword' && control?.hasError('minlength')) {
      return 'New password must be at least 8 characters';
    }
    
    if (field === 'confirmPassword' && control?.hasError('mismatch')) {
      return 'Passwords do not match';
    }
    
    return '';
  }
}

