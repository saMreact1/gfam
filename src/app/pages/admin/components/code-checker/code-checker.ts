import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VerificationService, VerifyResponse } from '../../../../core/services/verification.service';
import { AlertDialog, AlertDialogData } from '../../../../shared/components/alert-dialog';

@Component({
  selector: 'app-code-checker',
  standalone: false,
  templateUrl: './code-checker.html',
  styleUrl: './code-checker.scss'
})
export class CodeChecker {
  enteredCode = '';
  attendee: VerifyResponse | null = null;
  notFound = false;
  isLoading = false;
  alreadyCheckedIn = false;

  constructor(
    private dialog: MatDialog,
    private verificationService: VerificationService
  ) {}

  checkCode() {
    if (!this.enteredCode.trim()) {
      this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'warning', message: 'Please enter a code' } as AlertDialogData });
      return;
    }

    this.isLoading = true;
    this.notFound = false;
    this.attendee = null;
    this.alreadyCheckedIn = false;

    this.verificationService.verifyAttendee(this.enteredCode.trim()).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.responseCode === '00' && response.data) {
          this.attendee = response.data;
          this.notFound = false;
          this.alreadyCheckedIn = false;
          this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'success', message: response.message || 'Attendee verified successfully!' } as AlertDialogData });
        } else if (response.responseCode === '05' && response.data) {
          // User is already checked in
          this.attendee = response.data;
          this.notFound = false;
          this.alreadyCheckedIn = true;
          this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'warning', message: response.message || 'Attendee is already checked in!' } as AlertDialogData });
        } else {
          this.attendee = null;
          this.notFound = true;
          this.alreadyCheckedIn = false;
          this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'error', message: response.message || 'Attendee not found' } as AlertDialogData });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.attendee = null;
        this.notFound = true;
        this.alreadyCheckedIn = false;
        this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'error', message: 'No attendee found with that code' } as AlertDialogData });
      }
    });
  }

  clearSearch() {
    this.enteredCode = '';
    this.attendee = null;
    this.notFound = false;
    this.alreadyCheckedIn = false;
  }
}
