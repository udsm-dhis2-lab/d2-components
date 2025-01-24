import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  ModuleWithProviders,
  NgModule,
  inject,
  provideAppInitializer,
} from '@angular/core';

import {
  IndexDbService,
  IndexDbServiceConfig,
} from './services/index-db.service';

export function initializeDb(indexDbServiceConfig: IndexDbServiceConfig) {
  return () => new IndexDbService(indexDbServiceConfig);
}

// @dynamic
@NgModule({
  imports: [],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class NgxDhis2HttpClientModule {
  static forRoot(
    config: IndexDbServiceConfig
  ): ModuleWithProviders<NgxDhis2HttpClientModule> {
    return {
      ngModule: NgxDhis2HttpClientModule,
      providers: [
        { provide: IndexDbServiceConfig, useValue: config },
        provideAppInitializer(() => {
          const initializerFn = initializeDb(inject(IndexDbServiceConfig));
          return initializerFn() as unknown as void;
        }),
      ],
    };
  }
}
