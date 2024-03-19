import { Meta, StoryObj } from '@storybook/angular';

import { ComponentsComponent } from './components.component';

type ComponentWithCustomControls = ComponentsComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/Components',
  component: ComponentsComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `Components` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const Components: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
}
