import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

export interface OtpSendingData {
  email: string;
  message?: string;
}

@Component({
  selector: 'app-otp-sending-dialog',
  template: `
    <div class="otp-sending-dialog">
      <div class="icon-container">
        <div class="pulse-ring"></div>
        <mat-icon>mail</mat-icon>
      </div>

      <h2 mat-dialog-title class="dialog-title">Sending OTP</h2>

      <mat-dialog-content class="dialog-content">
        <p class="main-message">A one-time password is being sent to</p>
        <p class="email">{{ data.email }}</p>
        <p class="sub-message" *ngIf="data.message">{{ data.message }}</p>
        <div class="loading-bar">
          <div class="loading-progress"></div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="center">
        <button mat-raised-button class="proceed-btn" (click)="onProceed()">
          <mat-icon>arrow_forward</mat-icon>
          Enter OTP
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .otp-sending-dialog {
      text-align: center;
      padding: 1.5rem;
      max-width: 400px;
    }

    .icon-container {
      position: relative;
      display: inline-block;
      margin-bottom: 1.5rem;
    }

    .pulse-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid #c8952c;
      animation: pulse 1.5s ease-out infinite;
    }

    @keyframes pulse {
      0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
    }

    .icon-container mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #c8952c;
      position: relative;
      z-index: 1;
      background: #fdf6e3;
      border-radius: 50%;
      padding: 0.8rem;
    }

    .dialog-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: #1a1008;
      margin-bottom: 0.5rem;
    }

    .dialog-content {
      margin-bottom: 1rem;
    }

    .main-message {
      font-size: 0.95rem;
      color: #666;
      margin: 0 0 0.3rem;
    }

    .email {
      font-size: 1rem;
      font-weight: 600;
      color: #c8952c;
      margin: 0 0 0.8rem;
      word-break: break-all;
    }

    .sub-message {
      font-size: 0.85rem;
      color: #999;
      margin: 0 0 1rem;
    }

    .loading-bar {
      width: 100%;
      height: 4px;
      background: #f0e6d2;
      border-radius: 2px;
      overflow: hidden;
    }

    .loading-progress {
      width: 40%;
      height: 100%;
      background: linear-gradient(90deg, #c8952c, #f0c75e, #c8952c);
      border-radius: 2px;
      animation: slide 1.2s ease-in-out infinite;
    }

    @keyframes slide {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(350%); }
    }

    mat-dialog-actions {
      padding-top: 0.5rem;
    }

    .proceed-btn {
      background: linear-gradient(135deg, #c8952c, #a67518) !important;
      color: #fff !important;
      padding: 0.6rem 2rem;
      font-weight: 600;
      border-radius: 10px;
      border: none;
      box-shadow: 0 4px 12px rgba(200, 149, 44, 0.3);
      transition: transform 0.2s, box-shadow 0.2s;

      mat-icon {
        font-size: 1.1rem;
        width: auto;
        height: auto;
        margin-right: 0.3rem;
        vertical-align: middle;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(200, 149, 44, 0.4);
      }
    }
  `],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CommonModule
  ],
  standalone: true
})
export class OtpSendingDialog {
  constructor(
    public dialogRef: MatDialogRef<OtpSendingDialog>,
    @Inject(MAT_DIALOG_DATA) public data: OtpSendingData
  ) {}

  onProceed() {
    this.dialogRef.close('proceed');
  }
}
