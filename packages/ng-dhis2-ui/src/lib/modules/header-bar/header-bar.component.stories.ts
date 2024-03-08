import {
  Meta,
  StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular';

import { HeaderBarComponent } from './header-bar.component';
import { NgxDhis2HttpClientModule } from '@iapps/ngx-dhis2-http-client';
import { HttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';

type ComponentWithCustomControls = HeaderBarComponent;

const meta: Meta<ComponentWithCustomControls> = {
  title: 'Header Bar Wrapper',
  component: HeaderBarComponent,
  decorators: [
    moduleMetadata({
      imports: [
        // NgxDhis2HttpClientModule.forRoot({
        //   version: 1,
        //   namespace: 'header',
        //   models: [],
        // }),
      ],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(
          NgxDhis2HttpClientModule.forRoot({
            version: 1,
            namespace: 'header',
            models: [],
          })
        ),
      ],
    }),
  ],
  parameters: {
    docs: { description: { component: `HeaderBar` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const HeaderBar: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
};
