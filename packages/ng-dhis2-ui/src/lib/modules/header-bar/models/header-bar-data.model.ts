// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { D2HttpClient } from '@iapps/d2-web-sdk';
import { Observable, catchError, from, map, of, zip } from 'rxjs';
import { HeaderBarApp } from './header-bar-app.model';
import { HeaderBarNotification } from './header-bar-notification.model';

export class HeaderBarData {
  apps!: HeaderBarApp[];
  title!: string;
  help: any;
  notifications!: HeaderBarNotification;
  user!: Record<string, unknown>;

  constructor(private httpInstance: D2HttpClient) {}

  getApps(): Observable<HeaderBarApp[]> {
    return from(
      this.httpInstance.get('dhis-web-commons/menu/getModules.action', {
        useRootUrl: true,
      })
    ).pipe(
      map(
        (result) =>
          (result.data as { modules: Record<string, unknown>[] }) || {
            modules: [],
          }
      ),
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
    return from(this.httpInstance.get('me/dashboard')).pipe(
      map((notificationResponse) =>
        notificationResponse?.data
          ? new HeaderBarNotification(
              notificationResponse?.data as unknown as Record<string, number>
            )
          : null
      )
    );
  }

  get(): Observable<HeaderBarData | null> {
    return zip(
      this.getApps(),
      from(this.httpInstance.get('systemSettings/helpPageLink')).pipe(
        map((response) => response?.data)
      ),
      from(this.httpInstance.get('me/dashboard')).pipe(
        map((response) => response?.data as HeaderBarNotification)
      ),
      from(this.httpInstance.get('systemSettings/applicationTitle')).pipe(
        map((response) => response?.data)
      ),
      from(
        this.httpInstance.get(
          'me.json?fields=authorities,avatar,email,name,settings'
        )
      ).pipe(map((response) => response?.data))
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
