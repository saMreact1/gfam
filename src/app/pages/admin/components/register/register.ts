import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  registrationForm: FormGroup;

  roles: string[] = ['Minister', 'Pastor', 'Prophet', 'Apostle', 'Evangelist', 'Member'];
  ropeColors: string[] = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'White'];

  constructor(private fb: FormBuilder) {
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
      nursing: ['No'],
      ropeColor: ['']
    });

    this.registrationForm.get('gender')?.valueChanges.subscribe(gender => {
      if (gender !== 'Female') {
        this.registrationForm.get('nursing')?.reset('');
      }
    });
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      console.log(this.registrationForm.value);
      alert('Registration submitted successfully!');
    }
  }
}
