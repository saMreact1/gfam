import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AssignTagDialog } from '../modals/assign-tag';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-code-checker',
  standalone: false,
  templateUrl: './code-checker.html',
  styleUrl: './code-checker.scss'
})
export class CodeChecker {
  enteredCode = '';
  attendee: any = null;
  notFound = false;

  // Mock database (replace with API call later)
  attendees = [
    {
      code: 'REG-2025-12345',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '08012345678',
      role: 'Pastor',
      gender: 'Male',
      affiliation: 'Church of Zion',
      city: 'Lagos',
      state: 'Lagos',
      nursingOrPregnant: 'No',
      ropeColor: 'Blue',
      prayerTime: '12am - 2pm'
    },
    {
      code: 'REG-2025-54321',
      firstName: 'Mary',
      lastName: 'Smith',
      email: 'mary@example.com',
      phone: '08087654321',
      role: 'Minister',
      gender: 'Female',
      affiliation: 'Living Faith',
      city: 'Abuja',
      state: 'FCT',
      nursingOrPregnant: 'Pregnant',
      ropeColor: 'Red',
      prayerTime: '12am - 2pm'
    }
  ];

  constructor(
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  checkCode() {
    const found = this.attendees.find(a => a.code === this.enteredCode.trim());
    if (found) {
      this.attendee = found;
      this.notFound = false;
    } else {
      this.attendee = null;
      this.notFound = true;
    }
  }

   openAssignTagDialog() {
    const dialogRef = this.dialog.open(AssignTagDialog, {
      // width: '400px',
      data: { attendee: this.attendee },
    });

    dialogRef.afterClosed().subscribe((tagId) => {
      if (tagId) {
        // 🔹 Call API to save tag assignment
        console.log(`Tag ${tagId} assigned to`, this.attendee);
        this.attendee.tagId = tagId;
        this.snack.open('Tag Assigned Successfully', 'Close', {duration: 3000})
      }
    });
  }
}
