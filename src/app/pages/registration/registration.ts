import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-registration',
  standalone: false,
  templateUrl: './registration.html',
  styleUrl: './registration.scss'
})
export class Registration {
  registrationForm: FormGroup;
  roles: string[] = ['Minister', 'Pastor', 'Prophet', 'Evangelist', 'Apostle', 'Member'];
  ropeColors: string[] = ['White', 'Blue', 'Red', 'Green', 'Yellow', 'Purple', 'Gold', 'Black'];

  constructor(
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      role: ['', Validators.required],
      gender: ['', Validators.required],
      affiliation: [''],
      city: [''],
      state: [''],
      nursing: ['', Validators.required],
    })

    this.registrationForm.get('gender')?.valueChanges.subscribe(gender => {
      if (gender !== 'Female') {
        this.registrationForm.get('nursing')?.reset('');
      }
    });
  }

  onSubmit() {
    if(this.registrationForm.valid) {
      console.log('Attendee Registered successfully', this.registrationForm.value);
      this.snack.open('Registered Successfully.', 'Close', {duration: 3000});
      this.registrationForm.reset();
    }
  }
}
