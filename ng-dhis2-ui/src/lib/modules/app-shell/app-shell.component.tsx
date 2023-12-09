import { Component } from '@angular/core';
import { ReactWrapperComponent } from '../../shared/components';
import AppAdapter from '@dhis2/app-adapter'
import { Layer, layers, CenteredContent, CircularLoader } from '@dhis2/ui'
import React from 'react';

@Component({
  selector: 'ng-dhis2-ui-app-shell',
  template: '<ng-content></ng-content>',
})
export class AppShellComponent extends ReactWrapperComponent {
   appConfig = {
    // url: process.env.REACT_APP_DHIS2_BASE_URL,
    // appName: process.env.REACT_APP_DHIS2_APP_NAME || '',
    // appVersion: process.env.REACT_APP_DHIS2_APP_VERSION || '',
    // apiVersion: parseInt(process.env.REACT_APP_DHIS2_API_VERSION),
    // pwaEnabled: process.env.REACT_APP_DHIS2_APP_PWA_ENABLED === 'true',
    // plugin: process.env.REACT_APP_DHIS2_APP_PLUGIN === 'true',
}
  override component = <AppAdapter {...this.appConfig}>
  <React.Suspense
      fallback={
          <Layer level={layers.alert}>
              <CenteredContent>
                  <CircularLoader />
              </CenteredContent>
          </Layer>
      }
  >
      {/* <D2App config={appConfig} /> */}
  </React.Suspense>
</AppAdapter> as any
}
