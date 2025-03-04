import { Meta, StoryObj } from '@storybook/angular';
import { TransferFieldComponent } from './transfer-field.component';


type ComponentWithCustomControls = TransferFieldComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/Text Field',
  component: TransferFieldComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `TransferField` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const TextField: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
}
