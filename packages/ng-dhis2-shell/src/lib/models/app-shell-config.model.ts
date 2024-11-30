// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken } from '@angular/core';
import { AppManifest } from './app-manifest.model';
import {
  Observable,
  Subject,
  catchError,
  filter,
  firstValueFrom,
  of,
} from 'rxjs';

export interface AppShellConfig {
  url?: string;
  appName?: string;
  appVersion?: string;
  apiVersion?: number;
  pwaEnabled?: boolean;
  plugin?: boolean;
  isDevMode: boolean;
}

export class AppShellConfigClass implements AppShellConfig {
  url?: string;
  appName?: string;
  appVersion?: string;
  apiVersion?: number;
  pwaEnabled?: boolean;
  plugin?: boolean;
  isDevMode: boolean;

  constructor(config: Partial<AppShellConfig>) {
    this.isDevMode = config?.isDevMode ?? true;
    this.url = this.#setUrl(this.isDevMode, config?.url);
    this.appName = config?.appName;
    this.appVersion = config?.appVersion;
    this.apiVersion = config?.apiVersion;
    this.pwaEnabled = config?.pwaEnabled ?? false;
    this.plugin = config?.plugin ?? false;
  }

  #setUrl(isDevMode: boolean, url?: string) {
    if (url) {
      return url;
    }

    if (isDevMode) {
      return `${window.location.protocol}//${window.location.host}`;
    }

    return '../../../';
  }
}

export const APP_SHELL_CONFIG = new InjectionToken<AppShellConfigClass>(
  'appShellConfig'
);

@Injectable({
  providedIn: 'root',
})
export class AppShellConfigService {
  private appConfig$ = new Subject<AppShellConfigClass>();
  constructor(config: AppShellConfigClass, private httpClient: HttpClient) {
    this.init(config);
  }

  async init(config: AppShellConfigClass) {
    const manifest = await firstValueFrom(this.getAppManifest());

    let url = manifest?.activities?.dhis?.href;
    if (!config.isDevMode) {
      const systemInfo = await firstValueFrom(this.getSystemInfo());
      url = systemInfo ? (systemInfo['contextPath'] as string) : undefined;
    }

    this.appConfig$.next(
      new AppShellConfigClass({
        ...config,
        url,
        appName: manifest?.name,
        appVersion: manifest?.version?.toString(),
      })
    );
  }

  getAppManifest(): Observable<AppManifest | null> {
    return this.httpClient
      .get<AppManifest>('manifest.webapp')
      .pipe(catchError(() => of(null)));
  }

  getSystemInfo(): Observable<Record<string, unknown> | null> {
    return this.httpClient
      .get<Record<string, unknown>>('../../../api/system/info')
      .pipe(catchError(() => of(null)));
  }

  getConfig(): Observable<AppShellConfigClass> {
    return this.appConfig$
      .asObservable()
      .pipe(filter((appConfig) => appConfig !== null));
  }
}
