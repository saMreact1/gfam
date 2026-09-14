import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AdminAuthService, Role } from '../../../../core/services/admin-auth.service';
import { AlertDialog, AlertDialogData } from '../../../../shared/components/alert-dialog';

@Component({
  selector: 'app-invite-user',
  standalone: false,
  templateUrl: './invite-user.html',
  styleUrl: './invite-user.scss'
})
export class InviteUser {
  inviteForm: FormGroup;
  isLoading = false;
  roles = Object.values(Role);

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private authService: AdminAuthService
  ) {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(191)]],
      firstName: ['', [Validators.required, Validators.maxLength(80)]],
      lastName: ['', [Validators.required, Validators.maxLength(80)]],
      role: [Role.USER, [Validators.required]]
    });
  }

  onSubmit() {
    if (this.inviteForm.invalid) {
      this.markFormGroupTouched(this.inviteForm);
      return;
    }

    this.isLoading = true;
    const formData = {
      email: this.inviteForm.value.email,
      firstName: this.inviteForm.value.firstName,
      lastName: this.inviteForm.value.lastName,
      role: this.inviteForm.value.role
    };

    this.authService.inviteUser(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.responseCode === '00' && response.data) {
          this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'success', message: response.message || 'User invited successfully!' } as AlertDialogData });
          this.inviteForm.reset({ role: Role.USER });
        } else {
          this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'error', message: response.message || 'Failed to invite user' } as AlertDialogData });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'error', message: 'Failed to invite user. Please try again.' } as AlertDialogData });
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  resetForm() {
    this.inviteForm.reset({ role: Role.USER });
  }
}

