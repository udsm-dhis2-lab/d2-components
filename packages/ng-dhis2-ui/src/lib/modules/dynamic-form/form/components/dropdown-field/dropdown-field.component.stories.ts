import { Meta, StoryObj } from '@storybook/angular';

import { DropdownFieldComponent } from './dropdown-field.component';

type ComponentWithCustomControls = DropdownFieldComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/Dropdown Field',
  component: DropdownFieldComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `DropdownField` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const DropdownField: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
}
