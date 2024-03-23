import {
  Meta,
  StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular';

import { OrganisationUnitSelectorComponent } from './organisation-unit-selector-modal.component-modal';
import { importProvidersFrom } from '@angular/core';
import { NgxDhis2HttpClientModule } from '@iapps/ngx-dhis2-http-client';

type ComponentWithCustomControls = OrganisationUnitSelectorComponent;

const meta: Meta<ComponentWithCustomControls> = {
  title: 'Organisation unit',
  component: OrganisationUnitSelectorComponent,
  decorators: [
    moduleMetadata({
      imports: [],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(
          NgxDhis2HttpClientModule.forRoot({
            version: 1,
            namespace: 'organisation-unit',
            models: [],
          })
        ),
      ],
    }),
  ],

  parameters: {
    docs: { description: { component: `Organisation unit` } },
  },
  args: {
    orgUnitSelectionConfig: {
      usageType: 'DATA_VIEW',
      hideGroupSelect: false,
      hideLevelSelect: false,
      hideUserOrgUnits: false,
    },
  },
};

export default meta;
type Story = StoryObj<ComponentWithCustomControls>;

export const Default: Story = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
};
