import { Meta, StoryObj } from '@storybook/angular';

import { ButtonComponent } from './button.component';

type ComponentWithCustomControls = ButtonComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/Button',
  component: ButtonComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `Button` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const Button: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
}
