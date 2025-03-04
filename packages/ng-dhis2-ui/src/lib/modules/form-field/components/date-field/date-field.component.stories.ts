import { Meta, StoryObj } from '@storybook/angular';

import { DateFieldComponent } from './date-field.component';

type ComponentWithCustomControls = DateFieldComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/Date Field',
  component: DateFieldComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `DateField` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const DateField: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
}
