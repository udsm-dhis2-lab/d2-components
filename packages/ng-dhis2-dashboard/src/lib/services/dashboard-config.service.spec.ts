/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DashboardConfigService } from './dashboard-config.service';

describe('Service: DashboardConfig', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardConfigService]
    });
  });

  it('should ...', inject([DashboardConfigService], (service: DashboardConfigService) => {
    expect(service).toBeTruthy();
  }));
});
