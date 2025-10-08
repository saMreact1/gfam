import { Component, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  AttendeeService,
  AttendeeResponse,
  MinisterRole,
  Gender,
  RegistrationStatus,
  PagedAttendeeResponse
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
export class Attendees implements OnDestroy {
  displayedColumns: string[] = [
    'firstName', 'lastName', 'email', 'phone', 'prayerSlot', 'role', 'gender', 'registrationStatus', 'code'
  ];
  dataSource = new MatTableDataSource<Attendee>([]);
  allAttendees: Attendee[] = [];
  statusFilter: string = 'all';
  searchQuery: string = '';
  isLoading = false;
  eventId = 1;

  // Pagination
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  pageSizeOptions = [10, 20, 50, 100];

  // Search debounce
  private searchSubject = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private attendeeService: AttendeeService,
    private snack: MatSnackBar
  ) {
    // Debounce search input
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.searchQuery = searchValue;
      this.pageIndex = 0;
      this.loadAttendees();
    });
  }

  ngOnInit() {
    this.loadAttendees();
  }

  loadAttendees() {
    this.isLoading = true;
    const status = this.statusFilter !== 'all' ? this.statusFilter : undefined;
    const search = this.searchQuery || undefined;

    this.attendeeService.getAllAttendees(this.pageIndex, this.pageSize, status, search).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.responseCode === '00' && response.data) {
          const pagedData = response.data;
          // Map tagStatus to registrationStatus
          this.allAttendees = pagedData.content.map(attendee => ({
            ...attendee,
            registrationStatus: attendee.tagStatus
          }));
          this.dataSource.data = this.allAttendees;
          this.totalElements = pagedData.totalElements;
          console.log('📄 Pagination info:', {
            totalElements: pagedData.totalElements,
            totalPages: pagedData.totalPages,
            currentPage: pagedData.number,
            pageSize: pagedData.size,
            status: this.statusFilter,
            search: this.searchQuery
          });
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

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAttendees();
  }

  ngAfterViewInit() {
    // Don't use client-side pagination since we're doing server-side
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue);
  }

  applyStatusFilter() {
    // Reset to first page when filtering
    this.pageIndex = 0;
    this.loadAttendees();
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
      case RegistrationStatus.REGISTERED:
        return 'status-registered';
      case RegistrationStatus.CHECKED_IN:
        return 'status-checked-in';
      case RegistrationStatus.NO_SHOW:
        return 'status-no-show';
      case RegistrationStatus.CANCELLED:
        return 'status-cancelled';
      case RegistrationStatus.VIRTUAL:
        return 'status-virtual';
      default:
        return '';
    }
  }

  getStatusLabel(status: RegistrationStatus): string {
    switch (status) {
      case RegistrationStatus.REGISTERED:
        return '📝 Registered';
      case RegistrationStatus.CHECKED_IN:
        return '✅ Checked In';
      case RegistrationStatus.NO_SHOW:
        return '⚠️ No Show';
      case RegistrationStatus.CANCELLED:
        return '❌ Cancelled';
      case RegistrationStatus.VIRTUAL:
        return '💻 Virtual';
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

  ngOnDestroy() {
    this.searchSubject.complete();
  }
}
