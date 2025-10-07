import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { AdminAuthService, UserResponse } from '../../../../core/services/admin-auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
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
    private snack: MatSnackBar
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
        this.snack.open('Failed to load users', 'Close', { duration: 3000 });
      }
    });
  }

  deactivateUser(user: UserResponse) {
    if (!confirm(`Deactivate ${user.firstName} ${user.lastName}?`)) return;

    this.authService.deactivateUser(user.id).subscribe({
      next: (response) => {
        if (response.responseCode === '00') {
          this.snack.open('User deactivated successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        }
      },
      error: (err) => {
        this.snack.open('Failed to deactivate user', 'Close', { duration: 3000 });
      }
    });
  }
}

