import {
  applicationConfig,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@storybook/angular';
import { D2DashboardComponent } from './d2-dashboard.component';

import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { D2DashboardModule } from './d2-dashboard.module';

const meta: Meta<D2DashboardComponent> = {
  component: D2DashboardComponent,
  title: 'D2DashboardComponent',
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        D2DashboardModule.forRoot({
          useDataStore: true,
          dataStoreNamespace: 'afyamsafiri-dashboard',
          rootUrl: 'dashboard',
          selectionConfig: {
            allowSelectionOnStartUp: false,
            startUpPeriodType: 'Monthly',
            periodConfig: {
              openFuturePeriods: 1,
              allowDateRangeSelection: false,
            },
          },
        }),
        // StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
      ],
    }),
    applicationConfig({
      providers: [importProvidersFrom(StoreModule.forRoot({}))],
    }),
  ],
};
export default meta;
type Story = StoryObj<D2DashboardComponent>;

export const Primary: Story = {
  args: {},
};
