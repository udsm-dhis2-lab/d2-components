import { Meta, StoryObj } from '@storybook/angular';

import { DictionaryHeaderComponent } from './dictionary-header.component';

type ComponentWithCustomControls = DictionaryHeaderComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/Dictionary Header',
  component: DictionaryHeaderComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `DictionaryHeader` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const DictionaryHeader: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
}
