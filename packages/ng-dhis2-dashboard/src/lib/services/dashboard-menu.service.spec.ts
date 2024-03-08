/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DashboardMenuService } from './dashboard-menu.service';

describe('Service: DashboardMenu', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardMenuService]
    });
  });

  it('should ...', inject([DashboardMenuService], (service: DashboardMenuService) => {
    expect(service).toBeTruthy();
  }));
});
