import { Meta, StoryObj } from '@storybook/angular';

import { CheckboxComponent } from './checkbox.component';

type ComponentWithCustomControls = CheckboxComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/Checkbox',
  component: CheckboxComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `Checkbox` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const Checkbox: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
}
