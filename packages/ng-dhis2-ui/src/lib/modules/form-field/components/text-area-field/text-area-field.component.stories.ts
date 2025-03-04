import { Meta, StoryObj } from '@storybook/angular';

import { TextAreaFieldComponent } from './text-area-field.component';

type ComponentWithCustomControls = TextAreaFieldComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/Text Field',
  component: TextAreaFieldComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `TextAreaField` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const TextField: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
}
