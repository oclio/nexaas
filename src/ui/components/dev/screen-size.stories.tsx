import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ScreenSize from './screen-size';

const meta: Meta<typeof ScreenSize> = {
  title: 'Components/DevTools/ScreenSize',
  component: ScreenSize,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ScreenSize>;

function ScreenSizeStory() {
  return (
    <div className="bg-background min-h-screen w-full p-8">
      <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
        {
          'This dynamic development badge displays the current active breakpoint (XS to 2XL). Open the menu to adjust its position on the screen, its size, or to enable colored mode to visualize size changes at a glance.'
        }
      </p>
      <ScreenSize />
    </div>
  );
}

export const Default: Story = {
  render: () => <ScreenSizeStory />,
};
