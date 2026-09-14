import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { AdminAuthService, UserResponse } from '../../../../core/services/admin-auth.service';
import { AlertDialog, AlertDialogData } from '../../../../shared/components/alert-dialog';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class Users implements OnInit {
  users: UserResponse[] = [];
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'invitedBy', 'actions'];
  isLoading = false;

  constructor(
    private authService: AdminAuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.authService.getAllUsers().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.responseCode === '00' && response.data) {
          this.users = response.data;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'error', message: 'Failed to load users' } as AlertDialogData });
      }
    });
  }

  deactivateUser(user: UserResponse) {
    if (!confirm(`Deactivate ${user.firstName} ${user.lastName}?`)) return;

    this.authService.deactivateUser(user.id).subscribe({
      next: (response) => {
        if (response.responseCode === '00') {
          this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'success', message: 'User deactivated successfully' } as AlertDialogData });
          this.loadUsers();
        }
      },
      error: (err) => {
        this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'error', message: 'Failed to deactivate user' } as AlertDialogData });
      }
    });
  }
}

