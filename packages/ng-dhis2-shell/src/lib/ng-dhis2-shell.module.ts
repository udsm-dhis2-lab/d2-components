import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  ModuleWithProviders,
  NgModule,
  provideAppInitializer,
} from '@angular/core';
import { D2Web } from '@iapps/d2-web-sdk';
import { AppShellConfig, AppShellConfigClass } from './models';
import { NgDhis2ShellComponent } from './ng-dhis2-shell.component';

function initializeShell(config: AppShellConfig): () => Promise<void> {
  return async () => {
    try {
      await D2Web.initialize({
        indexDBConfig: config.indexDbConfig,
      });
    } catch (e) {
      console.warn('Web SDK could not get initialized');
    }

    return Promise.resolve();
  };
}

@NgModule({
  declarations: [NgDhis2ShellComponent],
  exports: [NgDhis2ShellComponent],
  imports: [],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class AppShellModule {
  static forRoot(config: AppShellConfig): ModuleWithProviders<AppShellModule> {
    return {
      ngModule: AppShellModule,
      providers: [
        { provide: AppShellConfigClass, useValue: config },
        provideAppInitializer(() => {
          return initializeShell(config)() as unknown as Promise<void>;
        }),
      ],
    };
  }
}
