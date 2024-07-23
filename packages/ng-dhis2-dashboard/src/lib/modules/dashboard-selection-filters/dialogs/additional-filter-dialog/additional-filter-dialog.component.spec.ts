/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdditionalFilterDialogComponent } from './additional-filter-dialog.component';

describe('AdditionalFilterDialogComponent', () => {
  let component: AdditionalFilterDialogComponent;
  let fixture: ComponentFixture<AdditionalFilterDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdditionalFilterDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
