import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

export interface Attendee {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  gender: string;
  affiliation: string;
  city: string;
  state: string;
  ropeColor: string;
  prayer?: string;
  tagAssigned?: boolean;
}

const ATTENDEE_DATA: Attendee[] = [
  { firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '08012345678', role: 'Pastor', gender: 'Male', affiliation: 'Faith Chapel', city: 'Lagos', state: 'Lagos', ropeColor: 'Blue', prayer: '12pm - 2pm', tagAssigned: true },
  { firstName: 'Mary', lastName: 'Smith', email: 'mary@example.com', phone: '08098765432', role: 'Minister', gender: 'Female', affiliation: 'Grace Tabernacle', city: 'Abuja', state: 'FCT', ropeColor: 'Red', tagAssigned: false },
];

@Component({
  selector: 'app-attendees',
  standalone: false,
  templateUrl: './attendees.html',
  styleUrl: './attendees.scss'
})
export class Attendees {
  displayedColumns: string[] = [
    'firstName', 'lastName', 'email', 'phone','prayer', 'role', 'gender', 'tagAssigned'
  ];
  dataSource = new MatTableDataSource<Attendee>(ATTENDEE_DATA);

  tagFilter: string = 'all';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyTagFilter() {
    if (this.tagFilter === 'all') {
      this.dataSource.data = ATTENDEE_DATA;
    } else if (this.tagFilter === 'tagged') {
      this.dataSource.data = ATTENDEE_DATA.filter(a => a.tagAssigned);
    } else if (this.tagFilter === 'untagged') {
      this.dataSource.data = ATTENDEE_DATA.filter(a => !a.tagAssigned);
    }
  }

  removeUser(user: Attendee) {
    const index = ATTENDEE_DATA.findIndex(a => a.email === user.email);
    if (index > -1) {
      ATTENDEE_DATA.splice(index, 1);
      this.applyTagFilter(); // refresh table
    }
  }

  downloadCSV() {
    const items = this.dataSource.filteredData.length ? this.dataSource.filteredData : this.dataSource.data;

    const headers = this.displayedColumns.join(',');
    const rows = items.map(item => 
      this.displayedColumns.map(col => (item as any)[col]).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendees.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
