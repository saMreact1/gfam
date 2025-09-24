import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Register } from '../../core/services/register';
import { SuccessDialog } from '../registration/components/success-dialog';

@Component({
  selector: 'app-otp-verification',
  standalone: false,
  templateUrl: './otp-verification.html',
  styleUrl: './otp-verification.scss'
})
export class OtpVerification implements OnInit, OnDestroy {
  otpForm: FormGroup;
  email: string = '';
  registrationData: any = null;
  isLoading = false;
  isVerifying = false;
  expiresInMinutes = 0;

  // Countdown timer properties
  countdownSeconds = 120; // 2 minutes
  countdownDisplay = '2:00';
  canResend = false;
  private countdownInterval: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private reg: Register
  ) {
    this.otpForm = this.fb.group({
      otpCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    // Get data from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.email = navigation.extras.state['email'];
      this.registrationData = navigation.extras.state['registrationData'];
    }
  }

  ngOnInit() {
    if (!this.email || !this.registrationData) {
      // If no data, redirect back to registration
      this.router.navigate(['/registration']);
      return;
    }

    // Send OTP automatically when component loads
    this.sendOtp();
  }

  ngOnDestroy() {
    // Clear countdown interval when component is destroyed
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  sendOtp() {
    this.isLoading = true;
    this.reg.sendOtp(this.registrationData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.expiresInMinutes = response.expiresInMinutes;
        this.snack.open(`OTP sent to ${this.email}`, 'Close', { duration: 3000 });

        // Start countdown timer
        this.startCountdown();
      },
      error: (err) => {
        this.isLoading = false;
        this.snack.open('Failed to send OTP. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  verifyOtp() {
    if (this.otpForm.invalid) return;

    this.isVerifying = true;
    const otpCode = this.otpForm.get('otpCode')?.value;

    this.reg.verifyOtp(this.email, otpCode).subscribe({
      next: (response) => {
        if (response.responseCode === '00') {
          // OTP verified successfully, proceed with registration
          this.proceedWithRegistration();
        } else {
          this.isVerifying = false;
          this.snack.open(response.message || 'Invalid OTP. Please try again.', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.isVerifying = false;
        this.snack.open('OTP verification failed. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  proceedWithRegistration() {
    this.reg.register(this.registrationData).subscribe({
      next: (res) => {
        this.isVerifying = false;
        // Open success dialog with proper message and icon
        this.dialog.open(SuccessDialog, {
          width: '500px',
          disableClose: true,
          data: {
            responseCode: res.responseCode,
            message: res.message,
            data: res.data
          }
        });
      },
      error: (err) => {
        this.isVerifying = false;
        // Use generic error message without exposing server details
        this.dialog.open(SuccessDialog, {
          width: '500px',
          disableClose: true,
          data: {
            responseCode: 'REGISTRATION_FAILED',
            message: 'Registration failed. Please check your information and try again.',
            data: null
          }
        });
      }
    });
  }

  startCountdown() {
    // Reset countdown
    this.countdownSeconds = 120; // 2 minutes
    this.canResend = false;
    this.updateCountdownDisplay();

    // Clear any existing interval
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    // Start new countdown
    this.countdownInterval = setInterval(() => {
      this.countdownSeconds--;
      this.updateCountdownDisplay();

      if (this.countdownSeconds <= 0) {
        this.canResend = true;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  updateCountdownDisplay() {
    const minutes = Math.floor(this.countdownSeconds / 60);
    const seconds = this.countdownSeconds % 60;
    this.countdownDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  resendOtp() {
    if (this.canResend && !this.isLoading) {
      this.isLoading = true;
      this.reg.resendOtp(this.email).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.expiresInMinutes = response.expiresInMinutes;
          this.snack.open(`OTP resent to ${this.email}`, 'Close', { duration: 3000 });

          // Start countdown timer
          this.startCountdown();
        },
        error: (err) => {
          this.isLoading = false;
          this.snack.open('Failed to resend OTP. Please try again.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/registration']);
  }
}
