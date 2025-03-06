/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactWrapperModule } from './react-wrapper.component';

describe('ReactComponentWrapperComponent', () => {
  let component: ReactWrapperModule;
  let fixture: ComponentFixture<ReactWrapperModule>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReactWrapperModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReactWrapperModule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
