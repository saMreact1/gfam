import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export type AlertDialogType = 'success' | 'error' | 'warning' | 'info';

export interface AlertDialogData {
  type: AlertDialogType;
  title?: string;
  message: string;
  buttonText?: string;
}

@Component({
  selector: 'app-alert-dialog',
  template: `
    <div class="alert-dialog" [ngClass]="'alert-' + data.type">
      <button class="close-btn" (click)="onClose()">
        <mat-icon>close</mat-icon>
      </button>

      <div class="icon-ring" [ngClass]="'ring-' + data.type">
        <div class="icon-bg" [ngClass]="'bg-' + data.type">
          <mat-icon>{{ getIcon() }}</mat-icon>
        </div>
      </div>

      <h2 class="alert-title">{{ getTitle() }}</h2>

      <mat-dialog-content class="alert-content">
        <p class="alert-message">{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions align="center">
        <button
          mat-raised-button
          [ngClass]="'btn-' + data.type"
          (click)="onClose()"
          mat-dialog-close
        >
          {{ data.buttonText || 'Got it' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .alert-dialog {
      text-align: center;
      padding: 2rem 1.5rem 1.5rem;
      max-width: 420px;
      position: relative;
      overflow: hidden;
    }

    .close-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      z-index: 1;

      &:hover {
        background: rgba(0, 0, 0, 0.06);
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #999;
      }
    }

    .icon-ring {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      margin: 0 auto 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .ring-success { background: rgba(76, 175, 80, 0.12); }
    .ring-error   { background: rgba(244, 67, 54, 0.12); }
    .ring-warning { background: rgba(255, 152, 0, 0.12); }
    .ring-info    { background: rgba(33, 150, 243, 0.12); }

    .icon-bg {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: #fff;
      }
    }

    .bg-success { background: linear-gradient(135deg, #66bb6a, #43a047); }
    .bg-error   { background: linear-gradient(135deg, #ef5350, #e53935); }
    .bg-warning { background: linear-gradient(135deg, #ffa726, #fb8c00); }
    .bg-info    { background: linear-gradient(135deg, #42a5f5, #1e88e5); }

    @keyframes popIn {
      0%   { transform: scale(0.5); opacity: 0; }
      100% { transform: scale(1);   opacity: 1; }
    }

    .alert-title {
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
    }

    .alert-success .alert-title { color: #2e7d32; }
    .alert-error   .alert-title { color: #c62828; }
    .alert-warning .alert-title { color: #e65100; }
    .alert-info    .alert-title { color: #1565c0; }

    .alert-content {
      margin: 0 0 1.25rem;
      padding: 0;
    }

    .alert-message {
      font-size: 0.95rem;
      color: #555;
      line-height: 1.6;
      margin: 0;
    }

    mat-dialog-actions {
      padding: 0;
    }

    .btn-success {
      background: linear-gradient(135deg, #66bb6a, #43a047) !important;
      color: #fff !important;
      border: none !important;
      border-radius: 10px !important;
      padding: 0 2rem !important;
      font-weight: 600 !important;
      text-transform: none !important;
      box-shadow: 0 4px 14px rgba(76, 175, 80, 0.35) !important;

      &:hover {
        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.5) !important;
      }
    }

    .btn-error {
      background: linear-gradient(135deg, #ef5350, #e53935) !important;
      color: #fff !important;
      border: none !important;
      border-radius: 10px !important;
      padding: 0 2rem !important;
      font-weight: 600 !important;
      text-transform: none !important;
      box-shadow: 0 4px 14px rgba(244, 67, 54, 0.35) !important;

      &:hover {
        box-shadow: 0 6px 20px rgba(244, 67, 54, 0.5) !important;
      }
    }

    .btn-warning {
      background: linear-gradient(135deg, #ffa726, #fb8c00) !important;
      color: #fff !important;
      border: none !important;
      border-radius: 10px !important;
      padding: 0 2rem !important;
      font-weight: 600 !important;
      text-transform: none !important;
      box-shadow: 0 4px 14px rgba(255, 152, 0, 0.35) !important;

      &:hover {
        box-shadow: 0 6px 20px rgba(255, 152, 0, 0.5) !important;
      }
    }

    .btn-info {
      background: linear-gradient(135deg, #42a5f5, #1e88e5) !important;
      color: #fff !important;
      border: none !important;
      border-radius: 10px !important;
      padding: 0 2rem !important;
      font-weight: 600 !important;
      text-transform: none !important;
      box-shadow: 0 4px 14px rgba(33, 150, 243, 0.35) !important;

      &:hover {
        box-shadow: 0 6px 20px rgba(33, 150, 243, 0.5) !important;
      }
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
export class AlertDialog {
  constructor(
    public dialogRef: MatDialogRef<AlertDialog>,
    @Inject(MAT_DIALOG_DATA) public data: AlertDialogData
  ) {}

  getIcon(): string {
    switch (this.data.type) {
      case 'success': return 'check_circle';
      case 'error':   return 'error';
      case 'warning': return 'warning';
      case 'info':    return 'info';
    }
  }

  getTitle(): string {
    if (this.data.title) return this.data.title;
    switch (this.data.type) {
      case 'success': return 'Success';
      case 'error':   return 'Error';
      case 'warning': return 'Warning';
      case 'info':    return 'Info';
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
