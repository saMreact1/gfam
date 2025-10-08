import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Register as RegisterService } from '../../../../core/services/register';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register implements OnInit {
  registrationForm: FormGroup;
  isLoading = false;

  roles: string[] = ['Minister', 'Pastor', 'Prophet', 'Evangelist', 'Apostle', 'Member'];
  states: any[] = [];

  constructor(
    private fb: FormBuilder,
    private snack: MatSnackBar,
    private registerService: RegisterService
  ) {
    this.registrationForm = this.fb.group({
      eventId: [1],
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
    this.registerService.getStates().subscribe((res: any) => {
      this.states = res.data;
    });
  }

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

    // Call registration endpoint directly with Bearer token (no OTP for admin)
    this.registerService.register(payload, true).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.responseCode === '00' && response.data) {
          this.snack.open(response.message || 'Registration successful!', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          // Show success details
          this.showSuccessMessage(response.data);
          // Reset form
          this.registrationForm.reset({
            eventId: 1,
            checkInDate: new Date()
          });
        } else {
          this.snack.open(response.message || 'Registration failed', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.snack.open(err.error?.message || 'Registration failed. Please try again.', 'Close', {
          duration: 3000
        });
      }
    });
  }

  showSuccessMessage(data: any) {
    const message = `
      Registration Code: ${data.code}
      Name: ${data.firstName} ${data.lastName}
      Prayer Time: ${data.prayerTime}
      Prayer Color: ${data.prayerColor}
      Coordinator: ${data.coordinatorName} (${data.coordinatorPhone})
    `;
    alert(message);
  }
}
