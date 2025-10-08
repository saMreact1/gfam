import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VerificationService, VerifyResponse } from '../../../../core/services/verification.service';

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
    private snack: MatSnackBar,
    private verificationService: VerificationService
  ) {}

  checkCode() {
    if (!this.enteredCode.trim()) {
      this.snack.open('Please enter a code', 'Close', { duration: 3000 });
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
          this.snack.open(response.message || 'Attendee verified successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        } else if (response.responseCode === '05' && response.data) {
          // User is already checked in
          this.attendee = response.data;
          this.notFound = false;
          this.alreadyCheckedIn = true;
          this.snack.open(response.message || 'Attendee is already checked in!', 'Close', {
            duration: 5000,
            panelClass: ['warning-snackbar']
          });
        } else {
          this.attendee = null;
          this.notFound = true;
          this.alreadyCheckedIn = false;
          this.snack.open(response.message || 'Attendee not found', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.attendee = null;
        this.notFound = true;
        this.alreadyCheckedIn = false;
        this.snack.open('No attendee found with that code', 'Close', { duration: 3000 });
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
