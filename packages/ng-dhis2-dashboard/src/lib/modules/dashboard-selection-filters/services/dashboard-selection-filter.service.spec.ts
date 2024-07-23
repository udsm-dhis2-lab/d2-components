/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DashboardSelectionFilterService } from './dashboard-selection-filter.service';

describe('Service: DashboardSelectionFilter', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardSelectionFilterService]
    });
  });

  it('should ...', inject([DashboardSelectionFilterService], (service: DashboardSelectionFilterService) => {
    expect(service).toBeTruthy();
  }));
});
