import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSelectionSummaryComponent } from './dashboard-selection-summary.component';

describe('DashboardSelectionSummaryComponent', () => {
  let component: DashboardSelectionSummaryComponent;
  let fixture: ComponentFixture<DashboardSelectionSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardSelectionSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardSelectionSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
