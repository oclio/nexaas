import { render, screen } from '@testing-library/react';
import * as nextIntl from 'next-intl';

import { app } from '@/config';
import { translationMock } from '@/tests/unit/mocks/intl';
import Logo from '@/ui/components/logo';

describe('Logo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(nextIntl, 'useTranslations');
    translationMock.mockImplementation((key: string) => {
      if (key === 'alt') return `${app.title} logo`;
      return key;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it.each([
      { attr: 'src', expected: '/images/logo.svg' },
      { attr: 'alt', expected: `${app.title} logo` },
    ])('image has $attr set correctly', ({ attr, expected }) => {
      render(<Logo />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute(attr, expected);
    });

    it('renders the app title in a span', () => {
      render(<Logo />);

      expect(screen.getByText(app.title)).toBeInTheDocument();
    });

    it('calls useTranslations with the components.logo namespace', () => {
      render(<Logo />);

      expect(nextIntl.useTranslations).toHaveBeenCalledWith('components.logo');
    });

    it('passes the translated alt text with app title to the image', () => {
      render(<Logo />);

      expect(translationMock).toHaveBeenCalledWith('alt', { app: app.title });
    });
  });

  describe('priority prop', () => {
    it.each([
      { priority: undefined, expected: 'false' },
      { priority: false, expected: 'false' },
      { priority: true, expected: 'true' },
    ])(
      'sets data-priority to $expected when priority is $priority',
      ({ priority, expected }) => {
        render(<Logo priority={priority} />);

        const image = screen.getByTestId('next-image');
        expect(image).toHaveAttribute('data-priority', expected);
      },
    );
  });

  describe('className prop', () => {
    it('applies a non-empty className by default', () => {
      const { container } = render(<Logo />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toBeTruthy();
    });

    it('merges custom className into the wrapper', () => {
      const { container } = render(<Logo className="custom-class" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('custom-class');
    });
  });
});
