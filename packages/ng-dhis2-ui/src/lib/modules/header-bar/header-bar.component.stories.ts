import { Meta, StoryObj } from '@storybook/angular';

import { HeaderBarComponent } from './header-bar.component';

type ComponentWithCustomControls = HeaderBarComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/Header Bar Wrapper',
  component: HeaderBarComponent,
  // decorators: [moduleMetadata({imports: []})],
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
