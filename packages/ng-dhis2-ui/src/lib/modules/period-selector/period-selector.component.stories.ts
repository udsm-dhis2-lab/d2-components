import { Meta, StoryObj } from '@storybook/angular';

import { PeriodSelectorComponent } from './period-selector.component';

type ComponentWithCustomControls = PeriodSelectorComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/Period Selector',
  component: PeriodSelectorComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `PeriodSelector` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const PeriodSelector: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
};
