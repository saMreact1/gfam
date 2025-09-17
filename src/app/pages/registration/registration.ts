import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Register } from '../../core/services/register';
import { SuccessDialog } from './components/success-dialog';

export interface RegistrationResponse {
  success: boolean;
  message: string;
  responseCode: string;
  data: {
    eventId: number;
    code: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    ministerRole: string;
    prayerColor: string;
    prayerTime: string;
    coordinatorName: string;
    coordinatorPhone: string;
    checkInDate: string;
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
    private reg: Register
  ) {
    this.registrationForm = this.fb.group({
      eventId: 1,
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      ministerRole: ['', Validators.required],
      gender: ['', Validators.required],
      churchName: ['', Validators.required],
      city: ['', Validators.required],
      stateId: ['', Validators.required],
      // lgaId: [null],
      // checkInDate: [new Date().toISOString().split('T')[0]],
      checkInDate: [new Date(), Validators.required],
      pregnantOrNursingTrue: [false],
      nursing: [''],
      attendsCs: [null, Validators.required]
    });

    this.registrationForm.get('gender')?.valueChanges.subscribe(gender => {
      if (gender !== 'Female') {
        this.registrationForm.patchValue({
          nursing: '',
          pregnantOrNursingTrue: false
        });
      }
    });

    this.registrationForm.get('attendsCs')?.valueChanges.subscribe(attendsCs => {
      if (attendsCs === 'No') {
        this.registrationForm.get('churchName')?.reset('');
      }
    });
  }

  ngOnInit() {
    this.reg.getStates().subscribe((res: any) => {
      this.states = res.data;
      console.log(this.states);
    });
  }

  onSubmit() {
    if (this.registrationForm.invalid) return;

    const raw = this.registrationForm.value;

    const payload = {
      ...raw,
      gender: raw.gender.toUpperCase(),
      ministerRole: raw.ministerRole.toUpperCase(),
      attendsCs: raw.attendsCs === 'Yes',
      pregnantOrNursingTrue: raw.gender === 'Female' ? raw.nursing === 'Yes' : false,
      checkInDate: new Date().toISOString().split('T')[0],
      // lgaId: null,
    };

    this.reg.register(payload).subscribe({
      next: (res) => {
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

        this.registrationForm.reset();
      },
      error: (err) => {
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
}
