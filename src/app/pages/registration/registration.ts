import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Register } from '../../core/services/register';

export interface RegistrationResponse {
  success: boolean;
  message: string;
  responseCode: string;
  data: {
    eventId?: number;
    code: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    ministerRole?: string;
    gender?: string;
    prayerColor: string;
    prayerTime: string;
    coordinatorName: string;
    coordinatorPhone: string;
    checkInDate: string | null;
    accommodationType: string;
    createdAt?: string;
    barcodeImage?: string;
    responseCode?: string;
  }
}

@Component({
  selector: 'app-registration',
  standalone: false,
  templateUrl: './registration.html',
  styleUrl: './registration.scss'
})
export class Registration implements OnInit {
  registrationForm: FormGroup;
  roles: string[] = ['Minister', 'Pastor', 'Prophet', 'Evangelist', 'Apostle', 'Member'];
  isEventLoading = true;
  eventError = '';

  states: any[] = [];

  constructor(
    private fb: FormBuilder,
    private snack: MatSnackBar,
    private router: Router,
    private reg: Register
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

    // Reset hostel captain volunteer when attendance changes to No
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

    this.reg.getStates().subscribe((res: any) => {
      this.states = res.data;
      console.log(this.states);
    });
  }

  isLoading = false;

  onSubmit() {
    if (this.isEventLoading || !this.registrationForm.get('eventId')?.value) {
      this.snack.open('Event is still loading. Please try again in a moment.', 'Close', { duration: 3000 });
      return;
    }

    if (this.registrationForm.invalid) {
      this.snack.open('Please fill all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    const raw = this.registrationForm.value;

    const payload = {
      ...raw,
      gender: raw.gender.toUpperCase(),
      ministerRole: raw.ministerRole.toUpperCase(),
      attendsCs: raw.attendsCs === 'Yes',
      pregnantOrNursingTrue: raw.gender === 'Female' ? raw.nursing === 'Yes' : false,
      checkInDate: new Date().toISOString().split('T')[0],
      attendPhysically: raw.attendance === 'Yes',
      volunteerAsHouseCaptain: raw.attendance === 'Yes' ? raw.volunteerHostelCaptain : false,
    };

    this.isLoading = true;
    this.reg.sendOtp(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.responseCode === 'ALREADY_REGISTERED') {
          this.snack.open(response.message || 'You are already registered. Your details have been sent to your email.', 'Close', { duration: 5000 });
          return;
        }

        this.router.navigate(['/otp-verification'], {
          state: {
            email: raw.email,
            registrationData: payload,
            expiresInMinutes: response.expiresInMinutes,
            message: response.message
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        const message = error?.error?.message || 'Failed to send OTP. Please try again.';
        this.snack.open(message, 'Close', { duration: 5000 });
      }
    });
  }

  private loadCurrentEvent(): void {
    this.isEventLoading = true;
    this.eventError = '';

    this.reg.getCurrentEvent().subscribe({
      next: (event) => {
        this.registrationForm.patchValue({ eventId: event.eventId });
        this.isEventLoading = false;
      },
      error: () => {
        this.isEventLoading = false;
        this.eventError = 'Unable to load the 2026 event. Please refresh and try again.';
        this.snack.open(this.eventError, 'Close', { duration: 4000 });
      }
    });
  }
}
