import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilefieldComponent } from './file-field.component';

describe('FilefieldComponent', () => {
  let component: FilefieldComponent;
  let fixture: ComponentFixture<FilefieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilefieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilefieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
