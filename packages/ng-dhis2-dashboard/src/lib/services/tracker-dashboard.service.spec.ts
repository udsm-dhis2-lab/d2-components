/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TrackerDashboardService } from './tracker-dashboard.service';

describe('Service: TrackerDashboard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TrackerDashboardService]
    });
  });

  it('should ...', inject([TrackerDashboardService], (service: TrackerDashboardService) => {
    expect(service).toBeTruthy();
  }));
});
