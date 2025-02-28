import { Meta, StoryObj } from '@storybook/angular';

import { SectionFormComponent } from './section-form.component';

type ComponentWithCustomControls = SectionFormComponent;

const meta: Meta<ComponentWithCustomControls> = {
  // title: 'Components/Section Form',
  component: SectionFormComponent,
  // decorators: [moduleMetadata({imports: []})],
  parameters: {
    docs: { description: { component: `SectionForm` } },
  },
  argTypes: {},
  args: {},
};
export default meta;

export const SectionForm: StoryObj<ComponentWithCustomControls> = {
  render: (args: ComponentWithCustomControls) => ({ props: args }),
  args: {},
}
