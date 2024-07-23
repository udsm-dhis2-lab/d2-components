/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DashboardItemService } from './dashboard-item.service';

describe('Service: DashboardItem', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardItemService]
    });
  });

  it('should ...', inject([DashboardItemService], (service: DashboardItemService) => {
    expect(service).toBeTruthy();
  }));
});
