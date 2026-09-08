import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  AttendeeArchiveEventResponse,
  AttendeeResponse,
  AttendeeService,
  Gender,
  MinisterRole,
  RegistrationStatus
} from '../../../../core/services/attendee.service';

export interface ArchivedAttendee {
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
  selector: 'app-attendee-archive',
  standalone: false,
  templateUrl: './attendee-archive.html',
  styleUrl: './attendee-archive.scss'
})
export class AttendeeArchive implements OnInit, OnDestroy {
  archivedEvents: AttendeeArchiveEventResponse[] = [];
  selectedEvent: AttendeeArchiveEventResponse | null = null;
  eventColumns: string[] = ['eventName', 'startDate', 'endDate', 'totalAttendees', 'checkedInAttendees'];
  attendeeColumns: string[] = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'prayerSlot',
    'role',
    'gender',
    'registrationStatus',
    'code'
  ];
  attendeeDataSource = new MatTableDataSource<ArchivedAttendee>([]);
  isLoadingEvents = false;
  isLoadingAttendees = false;
  eventsError = '';
  attendeesError = '';
  searchQuery = '';
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  pageSizeOptions = [10, 20, 50, 100];

  private searchSubject = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private attendeeService: AttendeeService,
    private snack: MatSnackBar
  ) {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.searchQuery = searchValue;
      this.pageIndex = 0;
      this.loadArchivedAttendees();
    });
  }

  ngOnInit(): void {
    this.loadArchiveEvents();
  }

  ngAfterViewInit(): void {
    this.attendeeDataSource.sort = this.sort;
  }

  loadArchiveEvents(): void {
    this.isLoadingEvents = true;
    this.eventsError = '';

    this.attendeeService.getArchiveEvents().subscribe({
      next: (response) => {
        this.isLoadingEvents = false;
        if (response.responseCode === '00' && response.data) {
          this.archivedEvents = response.data;
          return;
        }

        this.eventsError = response.message || 'Unable to load archived events.';
      },
      error: (err) => {
        this.isLoadingEvents = false;
        this.eventsError = err.error?.message || 'Unable to load archived events.';
      }
    });
  }

  selectEvent(event: AttendeeArchiveEventResponse): void {
    this.selectedEvent = event;
    this.pageIndex = 0;
    this.searchQuery = '';
    this.attendeeDataSource.data = [];
    this.totalElements = 0;
    this.loadArchivedAttendees();
  }

  loadArchivedAttendees(): void {
    if (!this.selectedEvent) {
      return;
    }

    this.isLoadingAttendees = true;
    this.attendeesError = '';

    this.attendeeService.getArchivedAttendees(
      this.selectedEvent.eventId,
      this.pageIndex,
      this.pageSize,
      this.searchQuery
    ).subscribe({
      next: (response) => {
        this.isLoadingAttendees = false;
        if (response.responseCode === '00' && response.data) {
          const pagedData = response.data;
          this.attendeeDataSource.data = pagedData.content.map(attendee => this.mapAttendee(attendee));
          this.totalElements = pagedData.totalElements;
          return;
        }

        this.attendeesError = response.message || 'Unable to load archived attendees.';
        this.attendeeDataSource.data = [];
        this.totalElements = 0;
      },
      error: (err) => {
        this.isLoadingAttendees = false;
        this.attendeesError = err.error?.message || 'Unable to load archived attendees.';
        this.attendeeDataSource.data = [];
        this.totalElements = 0;
      }
    });
  }

  onSearch(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadArchivedAttendees();
  }

  downloadCSV(): void {
    if (!this.selectedEvent) {
      return;
    }

    this.isLoadingAttendees = true;
    this.attendeeService.exportArchivedAttendees(this.selectedEvent.eventId).subscribe({
      next: (blob) => {
        this.isLoadingAttendees = false;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `archived-attendees-${this.selectedEvent?.eventId}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snack.open('Archive CSV downloaded successfully.', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.isLoadingAttendees = false;
        this.snack.open(err.error?.message || 'Unable to download archive CSV.', 'Close', { duration: 3000 });
      }
    });
  }

  isSelected(event: AttendeeArchiveEventResponse): boolean {
    return this.selectedEvent?.eventId === event.eventId;
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
        return 'Registered';
      case RegistrationStatus.CHECKED_IN:
        return 'Checked In';
      case RegistrationStatus.NO_SHOW:
        return 'No Show';
      case RegistrationStatus.CANCELLED:
        return 'Cancelled';
      case RegistrationStatus.VIRTUAL:
        return 'Virtual';
      default:
        return status;
    }
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  private mapAttendee(attendee: AttendeeResponse): ArchivedAttendee {
    return {
      ...attendee,
      registrationStatus: attendee.tagStatus
    };
  }
}
