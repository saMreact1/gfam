import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-assign-tag-dialog',
  template: `
    <h2 mat-dialog-title>Assign Tag</h2>
    <mat-dialog-content>
        <mat-form-field appearance="outline" class="w-full" style="width: 100%; margin-top: .5rem;">
            <mat-label>Tag ID</mat-label>
            <input matInput [(ngModel)]="tagId">
        </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-flat-button color="primary" (click)="assignTag()">Assign</button>
    </mat-dialog-actions>
  `,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    FormsModule
  ],
})
export class AssignTagDialog {
  tagId: string = '';

  constructor(
    public dialogRef: MatDialogRef<AssignTagDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  assignTag() {
    if (this.tagId.trim()) {
      this.dialogRef.close(this.tagId);
    }
  }
}
