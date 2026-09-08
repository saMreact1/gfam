import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Register as RegisterService } from '../../../../core/services/register';
import { SuccessDialog } from '../../../registration/components/success-dialog';

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

  constructor(
    private fb: FormBuilder,
    private snack: MatSnackBar,
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
      this.snack.open('Event is still loading. Please try again in a moment.', 'Close', { duration: 3000 });
      return;
    }

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
    this.registerService.register(payload).subscribe({
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
            eventId: this.currentEventId,
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
        this.snack.open('Unable to load the 2026 event. Please refresh and try again.', 'Close', { duration: 4000 });
      }
    });
  }
}
