import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Footer from './footer';

const meta: Meta<typeof Footer> = {
  title: 'App/Navigation/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="py-20">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Footer>;

export const Default: Story = {};
