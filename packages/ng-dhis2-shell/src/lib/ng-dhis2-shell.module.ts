import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import {
  AppShellConfig,
  AppShellConfigClass,
  AppShellConfigService,
} from './models';
import { NgDhis2ShellComponent } from './ng-dhis2-shell.component';

function initializeShell(
  appShellConfig: AppShellConfigClass,
  httpClient: HttpClient
) {
  return () => new AppShellConfigService(appShellConfig, httpClient);
}

@NgModule({ declarations: [NgDhis2ShellComponent],
    exports: [NgDhis2ShellComponent], imports: [], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppShellModule {
  static forRoot(config: AppShellConfig): ModuleWithProviders<AppShellModule> {
    return {
      ngModule: AppShellModule,
      providers: [
        { provide: AppShellConfigClass, useValue: config },
        {
          provide: APP_INITIALIZER,
          useFactory: initializeShell,
          deps: [AppShellConfigClass, HttpClient],
          multi: true,
        },
      ],
    };
  }
}
