import { fireEvent, render, screen } from '@testing-library/react';

const storeState = {
  isColored: false,
  position: 'bottomLeft' as string,
  setIsColored: vi.fn(),
  setPosition: vi.fn(),
  setSize: vi.fn(),
  size: 'md' as string,
};

vi.mock('../screen-size.store', () => ({
  PositionType: undefined,
  SizeType: undefined,
  useScreenSizeStore: () => storeState,
}));

const { default: ScreenSize } = await import('../screen-size');

describe('ScreenSize', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', 'development');
    Object.assign(storeState, {
      isColored: false,
      position: 'bottomLeft',
      setIsColored: vi.fn(),
      setPosition: vi.fn(),
      setSize: vi.fn(),
      size: 'md',
    });
  });

  describe('rendering', () => {
    it('renders the trigger button with all breakpoint labels', () => {
      render(<ScreenSize />);

      expect(screen.getByText('XS')).toBeInTheDocument();
      expect(screen.getByText('SM')).toBeInTheDocument();
      expect(screen.getByText('MD')).toBeInTheDocument();
      expect(screen.getByText('LG')).toBeInTheDocument();
      expect(screen.getByText('XL')).toBeInTheDocument();
      expect(screen.getByText('2XL')).toBeInTheDocument();
    });

    it('renders size options when dropdown is opened', () => {
      render(<ScreenSize />);

      fireEvent.click(screen.getByRole('button'));

      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
    });

    it('renders position options when dropdown is opened', () => {
      render(<ScreenSize />);

      fireEvent.click(screen.getByRole('button'));

      expect(screen.getByText('Bottom Left')).toBeInTheDocument();
      expect(screen.getByText('Bottom Right')).toBeInTheDocument();
      expect(screen.getByText('Top Right')).toBeInTheDocument();
      expect(screen.getByText('Top Left')).toBeInTheDocument();
    });

    it('renders the colored mode toggle when dropdown is opened', () => {
      render(<ScreenSize />);

      fireEvent.click(screen.getByRole('button'));

      expect(screen.getByText('Colored Mode')).toBeInTheDocument();
    });

    it('renders nothing in non-development environment', () => {
      vi.stubEnv('NODE_ENV', 'production');

      const { container } = render(<ScreenSize />);

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('dropdown positioning', () => {
    it.each([
      {
        position: 'bottomLeft',
        expectedAlign: 'start',
        expectedSide: 'bottom',
      },
      { position: 'bottomRight', expectedAlign: 'end', expectedSide: 'bottom' },
      { position: 'topLeft', expectedAlign: 'start', expectedSide: 'top' },
      { position: 'topRight', expectedAlign: 'end', expectedSide: 'top' },
    ])(
      'passes align=$expectedAlign and side=$expectedSide for position $position',
      ({ position, expectedAlign, expectedSide }) => {
        Object.assign(storeState, { position });

        render(<ScreenSize />);

        fireEvent.click(screen.getByRole('button'));

        const menuContent = screen.getByRole('menu');
        expect(menuContent.dataset.side).toBe(expectedSide);
        expect(menuContent.dataset.align).toBe(expectedAlign);
      },
    );
  });

  describe('position classes', () => {
    it.each([
      { position: 'bottomLeft', classes: ['bottom-4', 'left-4'] },
      { position: 'bottomRight', classes: ['right-4', 'bottom-4'] },
      { position: 'topRight', classes: ['top-4', 'right-4'] },
      { position: 'topLeft', classes: ['top-4', 'left-4'] },
    ])('applies $classes for position $position', ({ position, classes }) => {
      Object.assign(storeState, { position });

      render(<ScreenSize />);

      const button = screen.getByRole('button');
      for (const cls of classes) {
        expect(button.className).toContain(cls);
      }
    });
  });

  describe('size classes', () => {
    it.each([
      { size: 'sm', classes: ['size-7', 'text-xs'] },
      { size: 'md', classes: ['size-9', 'text-sm'] },
      { size: 'lg', classes: ['size-11', 'text-md'] },
    ])('applies $classes for size $size', ({ size, classes }) => {
      Object.assign(storeState, { size });

      render(<ScreenSize />);

      const button = screen.getByRole('button');
      for (const cls of classes) {
        expect(button.className).toContain(cls);
      }
    });
  });

  describe('colored mode', () => {
    it('does not apply colored classes when isColored is false', () => {
      render(<ScreenSize />);

      expect(screen.getByRole('button').className).not.toContain('bg-red-600');
    });

    it('applies colored classes when isColored is true', () => {
      Object.assign(storeState, { isColored: true });

      render(<ScreenSize />);

      expect(screen.getByRole('button').className).toContain('bg-red-600');
    });
  });

  describe('interactions', () => {
    it('calls setSize when a size option is clicked', () => {
      render(<ScreenSize />);

      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Small'));

      expect(storeState.setSize).toHaveBeenCalledWith('sm');
    });

    it('calls setPosition when a position option is clicked', () => {
      render(<ScreenSize />);

      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Top Right'));

      expect(storeState.setPosition).toHaveBeenCalledWith('topRight');
    });

    it('calls setIsColored when colored mode is toggled', () => {
      render(<ScreenSize />);

      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Colored Mode'));

      expect(storeState.setIsColored).toHaveBeenCalled();
    });
  });

  describe('checked states', () => {
    it.each([
      { activeSize: 'sm', inactiveLabels: ['Medium', 'Large'], label: 'Small' },
      { activeSize: 'md', inactiveLabels: ['Small', 'Large'], label: 'Medium' },
      { activeSize: 'lg', inactiveLabels: ['Small', 'Medium'], label: 'Large' },
    ])(
      'marks $label as checked and others as unchecked when size is $activeSize',
      ({ activeSize, inactiveLabels, label }) => {
        Object.assign(storeState, { size: activeSize });

        render(<ScreenSize />);

        fireEvent.click(screen.getByRole('button'));

        const item = screen.getByRole('menuitemcheckbox', {
          name: new RegExp(label),
        });
        expect(item).toHaveAttribute('aria-checked', 'true');

        for (const inactiveLabel of inactiveLabels) {
          const inactiveItem = screen.getByRole('menuitemcheckbox', {
            name: new RegExp(inactiveLabel),
          });
          expect(inactiveItem).toHaveAttribute('aria-checked', 'false');
        }
      },
    );

    it.each([
      {
        activePos: 'bottomLeft',
        inactiveLabels: ['Bottom Right', 'Top Right', 'Top Left'],
        label: 'Bottom Left',
      },
      {
        activePos: 'bottomRight',
        inactiveLabels: ['Bottom Left', 'Top Right', 'Top Left'],
        label: 'Bottom Right',
      },
      {
        activePos: 'topRight',
        inactiveLabels: ['Bottom Left', 'Bottom Right', 'Top Left'],
        label: 'Top Right',
      },
      {
        activePos: 'topLeft',
        inactiveLabels: ['Bottom Left', 'Bottom Right', 'Top Right'],
        label: 'Top Left',
      },
    ])(
      'marks $label as checked and others as unchecked when position is $activePos',
      ({ activePos, inactiveLabels, label }) => {
        Object.assign(storeState, { position: activePos });

        render(<ScreenSize />);

        fireEvent.click(screen.getByRole('button'));

        const item = screen.getByRole('menuitemcheckbox', {
          name: new RegExp(label),
        });
        expect(item).toHaveAttribute('aria-checked', 'true');

        for (const inactiveLabel of inactiveLabels) {
          const inactiveItem = screen.getByRole('menuitemcheckbox', {
            name: new RegExp(inactiveLabel),
          });
          expect(inactiveItem).toHaveAttribute('aria-checked', 'false');
        }
      },
    );

    it('marks Colored Mode as checked when isColored is true and unchecked when false', () => {
      Object.assign(storeState, { isColored: false });

      const { unmount } = render(<ScreenSize />);

      fireEvent.click(screen.getByRole('button'));

      const uncheckedItem = screen.getByRole('menuitemcheckbox', {
        name: /Colored Mode/,
      });
      expect(uncheckedItem).toHaveAttribute('aria-checked', 'false');

      unmount();
      Object.assign(storeState, { isColored: true });

      render(<ScreenSize />);

      fireEvent.click(screen.getByRole('button'));

      const checkedItem = screen.getByRole('menuitemcheckbox', {
        name: /Colored Mode/,
      });
      expect(checkedItem).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('size option icon classes', () => {
    it.each([
      { expectedClass: 'size-2', label: 'Small' },
      { expectedClass: 'size-2.5', label: 'Medium' },
      { expectedClass: 'size-3', label: 'Large' },
    ])(
      'renders $expectedClass on icon for $label',
      ({ label, expectedClass }) => {
        render(<ScreenSize />);

        fireEvent.click(screen.getByRole('button'));

        const item = screen.getByRole('menuitemcheckbox', {
          name: new RegExp(label),
        });
        const svgs = item.querySelectorAll('svg');
        const hasClass = [...svgs].some((svg) =>
          svg.getAttribute('class')?.includes(expectedClass),
        );
        expect(hasClass).toBe(true);
      },
    );
  });

  describe('className prop', () => {
    it('merges custom className with default classes', () => {
      render(<ScreenSize className="custom-class" />);

      expect(screen.getByRole('button').className).toContain('custom-class');
    });
  });

  describe('unmounted state (server snapshot)', () => {
    afterEach(() => {
      vi.resetModules();
      vi.doUnmock('react');
    });

    it('renders nothing when not mounted', async () => {
      vi.doMock('react', async () => {
        const actual = await vi.importActual<typeof import('react')>('react');
        return {
          ...actual,
          useSyncExternalStore: (
            _subscribe: unknown,
            _getSnapshot: unknown,
            getServerSnapshot: unknown,
          ) => (getServerSnapshot as () => boolean)(),
        };
      });
      vi.resetModules();

      const { default: ScreenSizeMocked } = await import('../screen-size');

      const { container } = render(<ScreenSizeMocked />);

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('modal configuration', () => {
    afterEach(() => {
      vi.resetModules();
      vi.doUnmock('@/ui/components/shadcn/dropdown-menu');
    });

    it('passes modal=false to DropdownMenu', async () => {
      vi.doMock('@/ui/components/shadcn/dropdown-menu', () => ({
        DropdownMenu: ({
          modal,
          children,
        }: {
          modal?: boolean;
          children: React.ReactNode;
        }) => (
          <div data-testid="dropdown-menu" data-modal={String(modal)}>
            {children}
          </div>
        ),
        DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
          <>{children}</>
        ),
        DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
          <div>{children}</div>
        ),
        DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => (
          <div>{children}</div>
        ),
        DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
          <div>{children}</div>
        ),
        DropdownMenuSeparator: () => <hr />,
        DropdownMenuCheckboxItem: ({
          children,
        }: {
          children: React.ReactNode;
        }) => (
          <div role="menuitemcheckbox" aria-checked="false">
            {children}
          </div>
        ),
      }));
      vi.resetModules();

      const { default: ScreenSizeMocked } = await import('../screen-size');

      render(<ScreenSizeMocked />);

      expect(screen.getByTestId('dropdown-menu')).toHaveAttribute(
        'data-modal',
        'false',
      );
    });
  });
});
