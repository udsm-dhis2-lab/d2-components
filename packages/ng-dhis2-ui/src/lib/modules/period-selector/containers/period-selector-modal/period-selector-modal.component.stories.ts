import { Meta, StoryObj } from '@storybook/angular';

import { PeriodSelectorModalComponent } from './period-selector-modal.component';

type ComponentWithCustomControls = PeriodSelectorModalComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/Period Selector Modal',
  component: PeriodSelectorModalComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `PeriodSelectorModal` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const PeriodSelectorModal: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
}
