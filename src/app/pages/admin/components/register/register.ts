import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Register as RegisterService } from '../../../../core/services/register';
import { SuccessDialog } from '../../../registration/components/success-dialog';
import { OtpSendingDialog } from '../modals/otp-sending';
import { OtpVerifyDialog } from '../modals/otp-verify';
import { AlertDialog, AlertDialogData } from '../../../../shared/components/alert-dialog';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register implements OnInit {
  registrationForm: FormGroup;
  isLoading = false;
  isEventLoading = true;
  currentEventId: number | null = null;

  roles: string[] = ['Minister', 'Pastor', 'Prophet', 'Evangelist', 'Apostle', 'Member'];
  states: any[] = [];

  private pendingPayload: any = null;
  private otpVerifyRef: MatDialogRef<OtpVerifyDialog> | null = null;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private registerService: RegisterService
  ) {
    this.registrationForm = this.fb.group({
      eventId: [null, Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^0\d{10}$/)]],
      ministerRole: ['', Validators.required],
      gender: ['', Validators.required],
      churchName: ['', Validators.required],
      city: ['', Validators.required],
      stateId: ['', Validators.required],
      checkInDate: [new Date(), Validators.required],
      pregnantOrNursingTrue: [false],
      nursing: [''],
      attendsCs: ['', Validators.required],
      attendance: ['', Validators.required],
      volunteerHostelCaptain: [false]
    });

    this.registrationForm.get('gender')?.valueChanges.subscribe(gender => {
      if (gender !== 'Female') {
        this.registrationForm.patchValue({
          nursing: '',
          pregnantOrNursingTrue: false
        });
      }
    });

    this.registrationForm.get('attendance')?.valueChanges.subscribe(attendance => {
      if (attendance !== 'Yes') {
        this.registrationForm.patchValue({
          volunteerHostelCaptain: false
        });
      }
    });
  }

  ngOnInit() {
    this.loadCurrentEvent();

    this.registerService.getStates().subscribe((res: any) => {
      this.states = res.data;
    });
  }

  onSubmit() {
    if (this.isEventLoading || !this.currentEventId) {
      this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'warning', message: 'Event is still loading. Please try again in a moment.' } as AlertDialogData });
      return;
    }

    if (this.registrationForm.invalid) {
      this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'warning', message: 'Please fill all required fields correctly' } as AlertDialogData });
      return;
    }

    this.isLoading = true;
    const raw = this.registrationForm.value;

    this.pendingPayload = {
      ...raw,
      gender: raw.gender.toUpperCase(),
      ministerRole: raw.ministerRole.toUpperCase(),
      attendsCs: raw.attendsCs === 'Yes',
      pregnantOrNursingTrue: raw.gender === 'Female' ? raw.nursing === 'Yes' : false,
      checkInDate: new Date().toISOString().split('T')[0],
      attendPhysically: raw.attendance === 'Yes',
      volunteerAsHouseCaptain: raw.attendance === 'Yes' ? raw.volunteerHostelCaptain : false,
    };

    // Send OTP first
    this.registerService.sendOtp(this.pendingPayload).subscribe({
      next: (response) => {
        this.isLoading = false;
        const responseCode = response.responseCode;

        if (responseCode === 'REGISTRATION_IDENTITY_CONFLICT') {
          this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'error', message: response.message || 'Identity conflict detected' } as AlertDialogData });
          return;
        }

        this.openOtpSendingDialog(this.pendingPayload.email);
      },
      error: (err) => {
        this.isLoading = false;
        const message = err.error?.message || 'Failed to send OTP. Please try again.';
        this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'error', message } as AlertDialogData });
      }
    });
  }

  private openOtpSendingDialog(email: string) {
    const sendingRef = this.dialog.open(OtpSendingDialog, {
      width: '420px',
      disableClose: true,
      data: { email }
    });

    sendingRef.afterClosed().subscribe(result => {
      if (result === 'proceed') {
        this.openOtpVerifyDialog(email);
      }
    });
  }

  private openOtpVerifyDialog(email: string) {
    this.otpVerifyRef = this.dialog.open(OtpVerifyDialog, {
      width: '420px',
      disableClose: true,
      data: { email, expiresInMinutes: 5 }
    });

    this.otpVerifyRef.afterClosed().subscribe(result => {
      if (!result) return;

      if (result.action === 'verify') {
        this.verifyOtp(email, result.otp);
      } else if (result.action === 'resend') {
        this.resendOtp(email);
      }
    });
  }

  private verifyOtp(email: string, otp: string) {
    this.registerService.verifyOtp(email, otp).subscribe({
      next: (response) => {
        const responseCode = response.responseCode || response.data?.responseCode;

        if (responseCode === 'OTP_VERIFICATION_SUCCESSFUL' || responseCode === 'REGISTRATION_SUCCESSFUL' || responseCode === 'REGISTRATION_VIRTUAL') {
          if (this.otpVerifyRef) {
            this.otpVerifyRef.close();
          }

          // Show success dialog with registration details
          this.dialog.open(SuccessDialog, {
            width: '500px',
            disableClose: true,
            data: {
              responseCode: response.data?.responseCode || responseCode,
              message: response.message,
              data: response.data
            }
          });

          this.registrationForm.reset({
            eventId: this.currentEventId,
            checkInDate: new Date()
          });
          this.pendingPayload = null;
        } else {
          if (this.otpVerifyRef) {
            this.otpVerifyRef.componentInstance.setError(
              response.message || 'Invalid OTP. Please try again.'
            );
          }
        }
      },
      error: (err) => {
        const message = err.error?.message || 'Verification failed. Please try again.';
        if (this.otpVerifyRef) {
          this.otpVerifyRef.componentInstance.setError(message);
        }
      }
    });
  }

  private resendOtp(email: string) {
    this.registerService.resendOtp(email).subscribe({
      next: () => {
        this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'success', message: 'OTP resent successfully' } as AlertDialogData });
        this.openOtpVerifyDialog(email);
      },
      error: (err) => {
        this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'error', message: err.error?.message || 'Failed to resend OTP' } as AlertDialogData });
        this.openOtpVerifyDialog(email);
      }
    });
  }

  private loadCurrentEvent(): void {
    this.isEventLoading = true;

    this.registerService.getCurrentEvent().subscribe({
      next: (event) => {
        this.currentEventId = event.eventId;
        this.registrationForm.patchValue({ eventId: event.eventId });
        this.isEventLoading = false;
      },
      error: () => {
        this.isEventLoading = false;
        this.dialog.open(AlertDialog, { width: '420px', disableClose: true, data: { type: 'error', message: 'Unable to load the 2026 event. Please refresh and try again.' } as AlertDialogData });
      }
    });
  }
}
