import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgDhis2ShellComponent } from './ng-dhis2-shell.component';

describe('NgDhis2ShellComponent', () => {
  let component: NgDhis2ShellComponent;
  let fixture: ComponentFixture<NgDhis2ShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgDhis2ShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NgDhis2ShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
