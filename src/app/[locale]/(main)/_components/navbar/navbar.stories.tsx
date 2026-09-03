import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Navbar from './navbar';

const meta: Meta<typeof Navbar> = {
  title: 'App/Navigation/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '1000px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Navbar>;

export const Default: Story = {};
