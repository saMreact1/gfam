import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AttendanceListDialog, AttendanceListDialogData } from './attendance-list-dialog';

describe('AttendanceListDialog', () => {
  let component: AttendanceListDialog;
  let fixture: ComponentFixture<AttendanceListDialog>;

  const dialogData: AttendanceListDialogData = {
    title: 'Total Registered',
    accent: 'total',
    status: 'all'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AttendanceListDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceListDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});