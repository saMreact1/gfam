import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AssignTagDialog } from '../modals/assign-tag';
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

  constructor(
    private dialog: MatDialog,
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

    this.verificationService.verifyAttendee(this.enteredCode.trim()).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.responseCode === '00' && response.data) {
          this.attendee = response.data;
          this.notFound = false;
          this.snack.open(response.message || 'Attendee verified successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        } else {
          this.attendee = null;
          this.notFound = true;
          this.snack.open(response.message || 'Attendee not found', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.attendee = null;
        this.notFound = true;
        this.snack.open('No attendee found with that code', 'Close', { duration: 3000 });
      }
    });
  }

  clearSearch() {
    this.enteredCode = '';
    this.attendee = null;
    this.notFound = false;
  }

   openAssignTagDialog() {
    if (!this.attendee) return;

    const dialogRef = this.dialog.open(AssignTagDialog, {
      // width: '400px',
      data: { attendee: this.attendee },
    });

    dialogRef.afterClosed().subscribe((tagId) => {
      if (tagId && this.attendee) {
        // 🔹 Call API to save tag assignment
        console.log(`Tag ${tagId} assigned to`, this.attendee);
        this.snack.open('Tag Assigned Successfully', 'Close', {duration: 3000})
      }
    });
  }
}
