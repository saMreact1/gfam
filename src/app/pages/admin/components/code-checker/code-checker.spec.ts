import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeChecker } from './code-checker';

describe('CodeChecker', () => {
  let component: CodeChecker;
  let fixture: ComponentFixture<CodeChecker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CodeChecker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeChecker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
