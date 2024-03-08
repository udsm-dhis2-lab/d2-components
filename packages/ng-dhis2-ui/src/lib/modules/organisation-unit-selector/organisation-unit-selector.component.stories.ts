import { Meta, StoryObj } from '@storybook/angular';

import { OrganisationUnitSelectorComponent } from './organisation-unit-selector.component';

type ComponentWithCustomControls = OrganisationUnitSelectorComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/Organisation Unit Selector',
  component: OrganisationUnitSelectorComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `OrganisationUnitSelector` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const OrganisationUnitSelector: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
};
