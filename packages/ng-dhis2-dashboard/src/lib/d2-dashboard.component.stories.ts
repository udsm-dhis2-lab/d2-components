import {
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@storybook/angular';
import { D2DashboardComponent } from './d2-dashboard.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
      ],
    }),
  ],
};
export default meta;
type Story = StoryObj<D2DashboardComponent>;

export const Primary: Story = {
  args: {},
};
