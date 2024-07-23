// Copyright 2024 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { ComponentPortal } from '@angular/cdk/portal';
import { Component } from '@angular/core';
import { AppComponent } from './app.component';
import { NgDhis2ShellWrapper } from '@iapps/ng-dhis2-shell';

@Component({
  selector: 'app-root',
  template: '<ng-dhis2-shell (shellHasLoaded)="onReady()"></ng-dhis2-shell>',
})
export class AppComponentWrapper extends NgDhis2ShellWrapper {
  override componentPortal: ComponentPortal<any> = new ComponentPortal(
    AppComponent
  );
}
