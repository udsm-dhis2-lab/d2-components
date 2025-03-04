import { Meta, StoryObj } from '@storybook/angular';

import { TextFieldComponent } from './text-field.component';

type ComponentWithCustomControls = TextFieldComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/Text Field',
  component: TextFieldComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `TextField` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const TextField: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
}
