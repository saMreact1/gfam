import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AttendeeService,
  AttendeeResponse,
  MinisterRole,
  Gender,
  RegistrationStatus
} from '../../../../core/services/attendee.service';

export interface Attendee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  prayerSlot: string;
  role: MinisterRole;
  gender: Gender;
  registrationStatus: RegistrationStatus;
  code: string;
}

@Component({
  selector: 'app-attendees',
  standalone: false,
  templateUrl: './attendees.html',
  styleUrl: './attendees.scss'
})
export class Attendees {
  displayedColumns: string[] = [
    'firstName', 'lastName', 'email', 'phone', 'prayerSlot', 'role', 'gender', 'registrationStatus', 'code'
  ];
  dataSource = new MatTableDataSource<Attendee>([]);
  allAttendees: Attendee[] = [];
  statusFilter: string = 'all';
  isLoading = false;
  eventId = 1;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private attendeeService: AttendeeService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadAttendees();
  }

  loadAttendees() {
    this.isLoading = true;
    this.attendeeService.getAllAttendees().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.responseCode === '00' && response.data) {
          // Map tagStatus to registrationStatus
          this.allAttendees = response.data.map(attendee => ({
            ...attendee,
            registrationStatus: attendee.tagStatus
          }));
          this.dataSource.data = this.allAttendees;
        } else {
          this.snack.open(response.message || 'Failed to load attendees', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.snack.open('Failed to load attendees. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyStatusFilter() {
    if (this.statusFilter === 'all') {
      this.dataSource.data = this.allAttendees;
    } else if (this.statusFilter === 'pending') {
      this.dataSource.data = this.allAttendees.filter(a => a.registrationStatus === RegistrationStatus.PENDING);
    } else if (this.statusFilter === 'approved') {
      this.dataSource.data = this.allAttendees.filter(a => a.registrationStatus === RegistrationStatus.APPROVED);
    } else if (this.statusFilter === 'checked_in') {
      this.dataSource.data = this.allAttendees.filter(a => a.registrationStatus === RegistrationStatus.CHECKED_IN);
    } else if (this.statusFilter === 'rejected') {
      this.dataSource.data = this.allAttendees.filter(a => a.registrationStatus === RegistrationStatus.REJECTED);
    }
  }

  removeUser(user: Attendee) {
    const index = this.allAttendees.findIndex(a => a.id === user.id);
    if (index > -1) {
      this.allAttendees.splice(index, 1);
      this.applyStatusFilter(); // refresh table
    }
  }

  getStatusClass(status: RegistrationStatus): string {
    switch (status) {
      case RegistrationStatus.PENDING:
        return 'status-pending';
      case RegistrationStatus.APPROVED:
        return 'status-approved';
      case RegistrationStatus.CHECKED_IN:
        return 'status-checked-in';
      case RegistrationStatus.REJECTED:
        return 'status-rejected';
      default:
        return '';
    }
  }

  getStatusLabel(status: RegistrationStatus): string {
    switch (status) {
      case RegistrationStatus.PENDING:
        return '⏳ Pending';
      case RegistrationStatus.APPROVED:
        return '✅ Approved';
      case RegistrationStatus.CHECKED_IN:
        return '🎫 Checked In';
      case RegistrationStatus.REJECTED:
        return '❌ Rejected';
      default:
        return status;
    }
  }

  downloadCSV() {
    this.isLoading = true;
    this.attendeeService.exportAttendees().subscribe({
      next: (blob) => {
        this.isLoading = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendees-event-${this.eventId}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snack.open('Attendees list downloaded successfully!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.isLoading = false;
        this.snack.open('Failed to download attendees list. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
