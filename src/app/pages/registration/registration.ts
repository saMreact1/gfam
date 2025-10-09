import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Register } from '../../core/services/register';
import { SuccessDialog } from './components/success-dialog';

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

  states: any[] = [];

  constructor(
    private fb: FormBuilder,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private reg: Register
  ) {
    this.registrationForm = this.fb.group({
      eventId: 1,
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
    this.reg.getStates().subscribe((res: any) => {
      this.states = res.data;
      console.log(this.states);
    });
  }

  isLoading = false;

  onSubmit() {
    if (this.registrationForm.invalid) {
      this.snack.open('Please fill all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
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

    // Call registration endpoint directly
    this.reg.register(payload).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Use the responseCode directly from the API
        const responseCode = response.responseCode || response.data?.responseCode;

        // Open success dialog for all cases (success, already registered, or failure)
        this.dialog.open(SuccessDialog, {
          width: '500px',
          disableClose: true,
          data: {
            responseCode: responseCode,
            message: response.message,
            data: response.data
          }
        });

        // Reset form only on successful registration (not for already registered)
        if (responseCode === 'REGISTRATION_SUCCESSFUL' || responseCode === 'REGISTRATION_VIRTUAL') {
          this.registrationForm.reset({
            eventId: 1,
            checkInDate: new Date()
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        // Show error dialog for network/server errors
        this.dialog.open(SuccessDialog, {
          width: '500px',
          disableClose: true,
          data: {
            responseCode: 'REGISTRATION_FAILED',
            message: err.error?.message || 'Registration failed. Please try again.',
            data: null
          }
        });
      }
    });
  }
}
