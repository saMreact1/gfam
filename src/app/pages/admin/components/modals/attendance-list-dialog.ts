import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  AttendeeResponse,
  AttendeeService,
  RegistrationStatus
} from '../../../../core/services/attendee.service';

export type AttendanceListAccent = 'total' | 'attended' | 'pending' | 'virtual';

export interface AttendanceListDialogData {
  title: string;
  accent: AttendanceListAccent;
  status: RegistrationStatus | 'all';
}

@Component({
  selector: 'app-attendance-list-dialog',
  standalone: false,
  templateUrl: './attendance-list-dialog.html',
  styleUrl: './attendance-list-dialog.scss'
})
export class AttendanceListDialog {
  displayedColumns: string[] = ['name', 'email', 'phone', 'role', 'code'];
  dataSource = new MatTableDataSource<AttendeeResponse>([]);
  isLoading = false;
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  pageSizeOptions = [10, 20, 50, 100];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AttendanceListDialogData,
    private attendeeService: AttendeeService
  ) {
    this.loadAttendees();
  }

  loadAttendees() {
    this.isLoading = true;
    const status = this.data.status !== 'all' ? this.data.status : undefined;
    this.attendeeService.getAllAttendees(this.pageIndex, this.pageSize, status).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.responseCode === '00' && response.data) {
          this.dataSource.data = response.data.content;
          this.totalElements = response.data.totalElements;
        }
      },
      error: () => {
        this.isLoading = false;
        this.dataSource.data = [];
        this.totalElements = 0;
      }
    });
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAttendees();
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
}