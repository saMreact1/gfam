import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface SuccessDialogData {
  responseCode: string;
  message?: string;
  data?: any;
}

@Component({
  selector: 'app-success-dialog',
  template: `
    <div class="success-dialog">
      <div class="icon-container" [ngClass]="getIconClass()">
        <mat-icon [ngClass]="getIconClass()">{{ getIcon() }}</mat-icon>
      </div>

      <h2 mat-dialog-title class="dialog-title" [ngClass]="getTitleClass()">{{ getTitle() }}</h2>

      <mat-dialog-content class="dialog-content">
        <p class="main-message">{{ getMainMessage() }}</p>
        <p class="sub-message" *ngIf="getSubMessage()">{{ getSubMessage() }}</p>

        <!-- Show registration details for successful registration -->
        <div *ngIf="data.responseCode === 'REGISTRATION_SUCCESSFUL' && data.data" class="registration-details">
          <div class="detail-item">
            <strong>Registration Code:</strong> {{ data.data.code }}
          </div>
          <div class="detail-item">
            <strong>Name:</strong> {{ data.data.firstName }} {{ data.data.lastName }}
          </div>
          <div class="detail-item">
            <strong>Prayer Time:</strong> {{ data.data.prayerTime }}
          </div>
          <div class="detail-item">
            <strong>Prayer Color:</strong> {{ data.data.prayerColor }}
          </div>
          <div class="detail-item">
            <strong>Coordinator:</strong> {{ data.data.coordinatorName }}
          </div>
          <div class="detail-item">
            <strong>Coordinator Phone:</strong> {{ data.data.coordinatorPhone }}
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="center">
        <button mat-raised-button [color]="getButtonColor()" [ngClass]="getButtonClass()" mat-dialog-close>
          {{ getButtonText() }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .success-dialog {
      text-align: center;
      padding: 1rem;
      max-width: 500px;
    }

    .icon-container {
      margin-bottom: 1rem;
    }

    .icon-container mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
    }

    .success-icon {
      color: #4caf50;
    }

    .warning-icon {
      color: #ff9800;
    }

    .error-icon {
      color: #f44336;
      animation: shake 0.5s ease-in-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .dialog-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #333;
    }

    .dialog-title.error-title {
      color: #f44336;
    }

    .dialog-content {
      margin-bottom: 1.5rem;
    }

    .main-message {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      color: #555;
    }

    .sub-message {
      font-size: 0.95rem;
      color: #777;
      margin-bottom: 1rem;
    }

    .registration-details {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
      text-align: left;
    }

    .detail-item {
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .detail-item strong {
      color: #333;
      margin-right: 0.5rem;
    }

    mat-dialog-actions {
      padding-top: 1rem;
    }

    button {
      min-width: 120px;
      font-weight: 500;
    }

    .error-button {
      background-color: #f44336 !important;
      color: white !important;
    }

    .error-button:hover {
      background-color: #d32f2f !important;
    }
  `],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    CommonModule
  ],
  standalone: true
})
export class SuccessDialog {
  constructor(
    public dialogRef: MatDialogRef<SuccessDialog>,
    @Inject(MAT_DIALOG_DATA) public data: SuccessDialogData
  ) {}

  getIcon(): string {
    switch (this.data.responseCode) {
      case 'REGISTRATION_SUCCESSFUL':
        return 'check_circle';
      case 'ALREADY_REGISTERED':
        return 'info';
      case 'ERROR':
      case 'REGISTRATION_FAILED':
        return 'error';
      default:
        return 'warning';
    }
  }

  getIconClass(): string {
    switch (this.data.responseCode) {
      case 'REGISTRATION_SUCCESSFUL':
        return 'success-icon';
      case 'ALREADY_REGISTERED':
        return 'warning-icon';
      case 'ERROR':
      case 'REGISTRATION_FAILED':
        return 'error-icon';
      default:
        return 'warning-icon';
    }
  }

  getTitle(): string {
    switch (this.data.responseCode) {
      case 'REGISTRATION_SUCCESSFUL':
        return 'Registration Successful!';
      case 'ALREADY_REGISTERED':
        return 'Already Registered';
      case 'ERROR':
      case 'REGISTRATION_FAILED':
        return 'Registration Failed';
      default:
        return 'Registration Status';
    }
  }

  getMainMessage(): string {
    switch (this.data.responseCode) {
      case 'REGISTRATION_SUCCESSFUL':
        return 'Thank you for registering! Your registration has been completed successfully.';
      case 'ALREADY_REGISTERED':
        return 'We already have your registration on file.';
      case 'ERROR':
      case 'REGISTRATION_FAILED':
        return this.data.message || 'Registration failed. Please try again.';
      default:
        return this.data.message || 'Registration completed.';
    }
  }

  getSubMessage(): string {
    switch (this.data.responseCode) {
      case 'REGISTRATION_SUCCESSFUL':
        return 'Please check your email for confirmation details and further instructions.';
      case 'ALREADY_REGISTERED':
        return 'We have resent a copy of your registration details to your email.';
      case 'ERROR':
      case 'REGISTRATION_FAILED':
        return 'Please double-check your information and try submitting again. If the problem continues, contact our support team.';
      default:
        return '';
    }
  }

  getButtonColor(): string {
    switch (this.data.responseCode) {
      case 'REGISTRATION_SUCCESSFUL':
        return 'primary';
      case 'ALREADY_REGISTERED':
        return 'accent';
      case 'ERROR':
      case 'REGISTRATION_FAILED':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getButtonText(): string {
    switch (this.data.responseCode) {
      case 'ERROR':
      case 'REGISTRATION_FAILED':
        return 'Try Again';
      default:
        return 'Got it!';
    }
  }

  getTitleClass(): string {
    switch (this.data.responseCode) {
      case 'ERROR':
      case 'REGISTRATION_FAILED':
        return 'error-title';
      default:
        return '';
    }
  }

  getButtonClass(): string {
    switch (this.data.responseCode) {
      case 'ERROR':
      case 'REGISTRATION_FAILED':
        return 'error-button';
      default:
        return '';
    }
  }
}
