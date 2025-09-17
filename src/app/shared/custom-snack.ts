import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'custom-snack',
  standalone: false,
  template:`
    <span class="custom-snack">
      <mat-icon>check_circle</mat-icon>
      <span>{{ data.message }}</span>
      <button mat-button color="accent" (click)="close()">UNDO</button>
    </span>
  `,
  styles: [`
    .custom-snack {
      display: flex;
    //   flex-direction: column;
      text-align: center;
      align-items: center;
      gap: 8px;
    }

    mat-icon {
        color: #4caf50;
    }
  `]
})
export class Custom {
  constructor(
    public snackRef: MatSnackBarRef<Custom>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) {}

  close() {
    this.snackRef.dismiss();
  }
}