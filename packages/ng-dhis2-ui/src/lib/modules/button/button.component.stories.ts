import {
  Meta,
  StoryObj,
  applicationConfig,
  moduleMetadata,
} from '@storybook/angular';

import { ButtonComponent } from './button.component';

type ComponentWithCustomControls = ButtonComponent;

const meta: Meta<ComponentWithCustomControls> = {
  title: 'Button Wrapper',
  component: ButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [],
    }),
  ],
  parameters: {
    docs: { description: { component: `Button` } },
  },
};

export default meta;
type Story = StoryObj<ComponentWithCustomControls>;

export const Default: Story = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {
    label: 'Default button',
  },
};

export const Primary: Story = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {
    label: 'Primary button',
    primary: true,
  },
};

export const Destructive: Story = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {
    label: 'Destructive button',
    destructive: true,
  },
};

export const Small: Story = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {
    label: 'Small button',
    small: true,
  },
};
