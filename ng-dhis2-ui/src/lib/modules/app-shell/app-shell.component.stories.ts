import { Meta, StoryObj } from '@storybook/angular';

import { AppShellComponent } from './app-shell.component';

type ComponentWithCustomControls = AppShellComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/App Shell',
  component: AppShellComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `AppShell` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const AppShell: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
}
