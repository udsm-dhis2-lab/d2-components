import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import {
  ButtonModule,
  HeaderBarModule,
  PeriodSelectorModule,
} from '@iapps/ng-dhis2-ui';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { NxWelcomeComponent } from './nx-welcome.component';
import { NgxDhis2HttpClientModule } from '@iapps/ngx-dhis2-http-client';

@NgModule({
  declarations: [AppComponent, NxWelcomeComponent],
  imports: [
    BrowserModule,
    HeaderBarModule,
    ButtonModule,
    PeriodSelectorModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    NgxDhis2HttpClientModule.forRoot({
      version: 1,
      models: {},
      namespace: '',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
