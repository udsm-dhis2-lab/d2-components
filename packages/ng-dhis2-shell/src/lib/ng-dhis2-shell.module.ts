import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  APP_INITIALIZER,
  InjectionToken,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  AppShellConfig,
  AppShellConfigClass,
  AppShellConfigService,
} from './models';
import { NgDhis2ShellComponent } from './ng-dhis2-shell.component';
import { firstValueFrom } from 'rxjs';
import { D2Web, D2WebConfig } from '@iapps/d2-web-sdk';

function initializeShell(
  appShellConfig: AppShellConfigClass,
  httpClient: HttpClient
) {
  const configService = new AppShellConfigService(appShellConfig, httpClient);
  initializeWedSDK(configService);
  return () => configService;
}

async function initializeWedSDK(
  appShellConfig: AppShellConfigService
): Promise<void> {
  try {
    const config = await firstValueFrom(appShellConfig.getConfig());

    if (window) {
      (window as any).d2Web = D2Web.getInstance(
        new D2WebConfig({
          baseUrl: config.url,
        })
      );
    }
  } catch (e) {
    console.warn('WebSDK could not get initialized');
  }
}

export const D2_WEB_SDK = new InjectionToken<any>('D2WebSDK');

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
