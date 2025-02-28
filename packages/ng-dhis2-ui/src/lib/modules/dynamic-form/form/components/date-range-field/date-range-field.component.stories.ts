import { Meta, StoryObj } from '@storybook/angular';

import { DateRangeFieldComponent } from './date-range-field.component';

type ComponentWithCustomControls = DateRangeFieldComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/Date Range Field',
  component: DateRangeFieldComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `DateRangeField` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const DateRangeField: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
}
