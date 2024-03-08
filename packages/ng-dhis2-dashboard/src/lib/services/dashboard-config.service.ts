import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { DashboardConfig } from '../models';

export class DashboardConfigClass implements DashboardConfig {
  useDataStore = false;
  dataStoreNamespace = '';
  rootUrl = 'dashboard';
}

export const DASHBOARD_CONFIG = new InjectionToken<DashboardConfig>(
  'dashboardConfig'
);

@Injectable({ providedIn: 'root' })
export class DashboardConfigService {
  constructor(
    @Optional() @Inject(DASHBOARD_CONFIG) private config: DashboardConfig
  ) {}

  getConfig(): DashboardConfig {
    return this.config;
  }
}
