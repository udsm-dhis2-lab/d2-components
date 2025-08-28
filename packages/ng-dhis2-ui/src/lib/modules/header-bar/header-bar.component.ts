import { Component, ElementRef, inject } from '@angular/core';
import { DataProvider } from '@dhis2/app-runtime';
import { D2Window } from '@iapps/d2-web-sdk';
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { firstValueFrom } from 'rxjs';
import { ReactWrapperModule } from '../react-wrapper/react-wrapper.component';
import { HeaderBarData } from './models';
import { HeaderBar } from './utils/header-bar';

@Component({
  selector: 'ng-dhis2-ui-header-bar',
  template: `<ng-container></ng-container>`,
  standalone: false,
})
export class HeaderBarComponent extends ReactWrapperModule {
  constructor() {
    super(inject(ElementRef<HTMLElement>));
  }

  override async ngAfterViewInit() {
    const d2 = (window as unknown as D2Window)?.d2Web;

    if (d2) {
      if (!this.elementRef) throw new Error('No element ref');
      this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);
      const manifest = d2.appManifest;
      const data = await firstValueFrom(
        new HeaderBarData(d2.httpInstance).get()
      );

      this.component = data
        ? () => {
            const headerBarElement = React.createElement(
              HeaderBar as unknown as React.ComponentType<any>,
              {
                appName: manifest?.name,
                data: data,
              }
            );
            return React.createElement(DataProvider, null, headerBarElement);
          }
        : () => React.createElement('div', null, 'Something went wrong');
      this.render();
    }
  }
}
