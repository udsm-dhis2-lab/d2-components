/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldControlService } from '../../services';
import { FormComponent } from './form.component';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  class FieldControlMock {
    toFormGroup() {}
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: FieldControlService, useClass: FieldControlMock }],
      declarations: [FormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
