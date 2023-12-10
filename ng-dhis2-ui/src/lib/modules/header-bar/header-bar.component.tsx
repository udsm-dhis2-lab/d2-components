import { Component, ElementRef } from '@angular/core';
import { DataProvider } from '@dhis2/app-runtime';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import { firstValueFrom } from 'rxjs';
import { ReactWrapperComponent } from '../../shared/components';
import { HeaderBarData } from './models';
import { HeaderBar } from './utils/header-bar';

@Component({
  selector: 'ng-dhis2-ui-header-bar',
  template: `<ng-container></ng-container>`,
})
export class HeaderBarComponent extends ReactWrapperComponent {
  constructor(
    elementRef: ElementRef<HTMLElement>,
    private httpClient: NgxDhis2HttpClientService
  ) {
    super(elementRef);
  }

  override async ngAfterViewInit() {
    if (!this.elementRef) throw new Error('No element ref');
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);
    const manifest = await firstValueFrom(this.httpClient.manifest());
    const data = await firstValueFrom(new HeaderBarData(this.httpClient).get());

    this.component = data
      ? () => (
          <DataProvider>
            {<HeaderBar appName={manifest?.name} data={data} />}
          </DataProvider>
        )
      : () => <div>Something went wrong</div>;
    this.render();
  }
}
