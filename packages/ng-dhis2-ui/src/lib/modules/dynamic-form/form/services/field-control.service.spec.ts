/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FieldControlService } from './field-control.service';

describe('Service: FieldControl', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FieldControlService]
    });
  });

  it('should ...', inject([FieldControlService], (service: FieldControlService) => {
    expect(service).toBeTruthy();
  }));
});
