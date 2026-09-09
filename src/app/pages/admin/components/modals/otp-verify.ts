import { Component, Inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

export interface OtpVerifyData {
  email: string;
  expiresInMinutes?: number;
}

@Component({
  selector: 'app-otp-verify-dialog',
  template: `
    <div class="otp-verify-dialog">
      <button class="close-btn" mat-icon-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
      </button>

      <div class="icon-container">
        <mat-icon>shield</mat-icon>
      </div>

      <h2 mat-dialog-title class="dialog-title">Verify OTP</h2>

      <mat-dialog-content class="dialog-content">
        <p class="sub-text">Enter the 6-digit code sent to</p>
        <p class="email">{{ data.email }}</p>

        <div class="otp-inputs">
          <input
            *ngFor="let digit of [0,1,2,3,4,5]; let i = index"
            #otpInput
            type="text"
            maxlength="1"
            class="otp-digit"
            [id]="'otp-' + i"
            [(ngModel)]="otpDigits[i]"
            (input)="onInput(i, $event)"
            (keydown)="onKeyDown(i, $event)"
            (paste)="onPaste($event)"
            [class.filled]="otpDigits[i]"
            [class.error]="hasError"
          />
        </div>

        <p class="error-text" *ngIf="hasError">{{ errorMessage }}</p>

        <div class="timer" *ngIf="!canResend">
          <mat-icon>timer</mat-icon>
          <span>Resend in {{ timerDisplay }}</span>
        </div>

        <button
          *ngIf="canResend"
          mat-button
          class="resend-btn"
          (click)="onResend()"
          [disabled]="isResending"
        >
          <mat-icon *ngIf="!isResending">refresh</mat-icon>
          <mat-spinner *ngIf="isResending" diameter="16"></mat-spinner>
          {{ isResending ? 'Sending...' : 'Resend OTP' }}
        </button>
      </mat-dialog-content>

      <mat-dialog-actions align="center">
        <button mat-button class="cancel-btn" (click)="onCancel()">Cancel</button>
        <button
          mat-raised-button
          class="verify-btn"
          [disabled]="getOtp().length !== 6 || isVerifying"
          (click)="onVerify()"
        >
          <mat-spinner *ngIf="isVerifying" diameter="20"></mat-spinner>
          <mat-icon *ngIf="!isVerifying">check_circle</mat-icon>
          <span *ngIf="!isVerifying">Verify</span>
          <span *ngIf="isResending">Verifying...</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .otp-verify-dialog {
      text-align: center;
      padding: 1.5rem;
      max-width: 400px;
      position: relative;
    }

    .close-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      color: #999;
    }

    .icon-container {
      margin-bottom: 1rem;
    }

    .icon-container mat-icon {
      font-size: 3.5rem;
      width: 3.5rem;
      height: 3.5rem;
      color: #c8952c;
      background: #fdf6e3;
      border-radius: 50%;
      padding: 0.8rem;
    }

    .dialog-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: #1a1008;
      margin-bottom: 0.3rem;
    }

    .dialog-content {
      margin-bottom: 0.5rem;
    }

    .sub-text {
      font-size: 0.9rem;
      color: #666;
      margin: 0 0 0.2rem;
    }

    .email {
      font-size: 0.95rem;
      font-weight: 600;
      color: #c8952c;
      margin: 0 0 1.5rem;
      word-break: break-all;
    }

    .otp-inputs {
      display: flex;
      justify-content: center;
      gap: 0.6rem;
      margin-bottom: 1rem;
    }

    .otp-digit {
      width: 48px;
      height: 56px;
      text-align: center;
      font-size: 1.5rem;
      font-weight: 700;
      border: 2px solid #ddd;
      border-radius: 12px;
      outline: none;
      background: #fafafa;
      color: #1a1008;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      caret-color: #c8952c;

      &:focus {
        border-color: #c8952c;
        box-shadow: 0 0 0 3px rgba(200, 149, 44, 0.15);
        background: #fff;
      }

      &.filled {
        border-color: #c8952c;
        background: #fdf6e3;
      }

      &.error {
        border-color: #e53935;
        animation: shake 0.4s ease;
      }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }

    .error-text {
      color: #e53935;
      font-size: 0.85rem;
      margin: 0 0 0.5rem;
    }

    .timer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.3rem;
      color: #999;
      font-size: 0.85rem;
      margin-top: 0.5rem;

      mat-icon {
        font-size: 1rem;
        width: auto;
        height: auto;
      }
    }

    .resend-btn {
      color: #c8952c !important;
      font-weight: 600;
      margin-top: 0.5rem;

      mat-icon {
        font-size: 1rem;
        width: auto;
        height: auto;
        margin-right: 0.3rem;
        vertical-align: middle;
      }
    }

    mat-dialog-actions {
      padding-top: 0.5rem;
      gap: 0.8rem;
    }

    .cancel-btn {
      color: #666;
      font-weight: 500;
    }

    .verify-btn {
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

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(200, 149, 44, 0.4);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    @media (max-width: 400px) {
      .otp-digit {
        width: 42px;
        height: 50px;
        font-size: 1.3rem;
      }

      .otp-inputs {
        gap: 0.4rem;
      }
    }
  `],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    CommonModule
  ],
  standalone: true
})
export class OtpVerifyDialog implements OnDestroy {
  otpDigits: string[] = ['', '', '', '', '', ''];
  hasError = false;
  errorMessage = '';
  isVerifying = false;
  isResending = false;
  canResend = false;
  timerDisplay = '';
  private timerInterval: any;
  private resendSeconds = 0;

  constructor(
    public dialogRef: MatDialogRef<OtpVerifyDialog>,
    @Inject(MAT_DIALOG_DATA) public data: OtpVerifyData
  ) {
    this.startTimer(data.expiresInMinutes || 5);
  }

  onInput(index: number, event: any) {
    const value = event.target.value;
    this.hasError = false;

    if (value && index < 5) {
      const next = document.getElementById('otp-' + (index + 1));
      next?.focus();
    }
  }

  onKeyDown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const prev = document.getElementById('otp-' + (index - 1));
      prev?.focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      for (let i = 0; i < pasted.length; i++) {
        this.otpDigits[i] = pasted[i];
      }
      const nextIndex = Math.min(pasted.length, 5);
      const next = document.getElementById('otp-' + nextIndex);
      next?.focus();
    }
  }

  getOtp(): string {
    return this.otpDigits.join('');
  }

  onVerify() {
    const otp = this.getOtp();
    if (otp.length !== 6) return;

    this.isVerifying = true;
    this.hasError = false;
    this.dialogRef.close({ action: 'verify', otp });
  }

  onResend() {
    this.isResending = true;
    this.dialogRef.close({ action: 'resend' });
  }

  onCancel() {
    this.dialogRef.close({ action: 'cancel' });
  }

  setError(message: string) {
    this.hasError = true;
    this.errorMessage = message;
    this.isVerifying = false;
    this.otpDigits = ['', '', '', '', '', ''];
    const first = document.getElementById('otp-0');
    first?.focus();
  }

  private startTimer(minutes: number) {
    this.resendSeconds = minutes * 60;
    this.canResend = false;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.resendSeconds--;
      this.updateTimerDisplay();

      if (this.resendSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.canResend = true;
      }
    }, 1000);
  }

  private updateTimerDisplay() {
    const mins = Math.floor(this.resendSeconds / 60);
    const secs = this.resendSeconds % 60;
    this.timerDisplay = `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }
}
