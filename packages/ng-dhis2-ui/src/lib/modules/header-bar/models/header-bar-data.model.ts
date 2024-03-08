// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { Observable, catchError, map, of, zip } from 'rxjs';
import { HeaderBarApp } from './header-bar-app.model';
import { HeaderBarNotification } from './header-bar-notification.model';

export class HeaderBarData {
  apps!: HeaderBarApp[];
  title!: string;
  help: any;
  notifications!: HeaderBarNotification;
  user!: Record<string, unknown>;

  constructor(private httpClient: NgxDhis2HttpClientService) {}

  getApps(): Observable<HeaderBarApp[]> {
    return this.httpClient
      .get('dhis-web-commons/menu/getModules.action', {
        useRootUrl: true,
      })
      .pipe(
        catchError(() =>
          of({
            modules: [],
          })
        ),
        map((result: { modules: Record<string, unknown>[] }) => {
          return (result?.modules || [])
            .map((module: Record<string, unknown>) => new HeaderBarApp(module))
            .filter((headerBarApp) => headerBarApp);
        })
      );
  }

  getNotifications(): Observable<HeaderBarNotification | null> {
    return this.httpClient
      .get('me/dashboard')
      .pipe(
        map((notifications: Record<string, number>) =>
          notifications ? new HeaderBarNotification(notifications) : null
        )
      );
  }

  get(): Observable<HeaderBarData | null> {
    return zip(
      this.getApps(),
      this.httpClient.get('systemSettings/helpPageLink'),
      this.httpClient.get('me/dashboard'),
      this.httpClient.get('systemSettings/applicationTitle'),
      this.httpClient.get(
        'me.json?fields=authorities,avatar,email,name,settings'
      )
    ).pipe(
      map(
        (response: [HeaderBarApp[], any, HeaderBarNotification, any, any]) => {
          if (response) {
            const [apps, help, notifications, title, user] = response;
            this.apps = apps;
            this.help = help;
            this.notifications = notifications;
            this.title = title as string;
            this.user = user;

            return this;
          }

          return null;
        }
      ),
      catchError(() => {
        return of(null);
      })
    );
  }
}
