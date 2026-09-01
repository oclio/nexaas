import { render, screen } from '@testing-library/react';

import { sentryMocks } from '@/tests/unit/mocks/observability';

const { default: GlobalError } = await import('../global-error');

describe('GlobalError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('Sentry capture', () => {
    it('captures exception to Sentry on mount', () => {
      const error = new Error('Something went wrong');

      render(<GlobalError error={error} />);

      expect(sentryMocks.captureException).toHaveBeenCalledWith(error);
      expect(sentryMocks.captureException).toHaveBeenCalledOnce();
    });

    it('captures exception again when error changes', () => {
      const { rerender } = render(<GlobalError error={new Error('First')} />);

      const secondError = new Error('Second');
      rerender(<GlobalError error={secondError} />);

      expect(sentryMocks.captureException).toHaveBeenCalledTimes(2);
      expect(sentryMocks.captureException).toHaveBeenLastCalledWith(
        secondError,
      );
    });

    it('does not recapture when error reference stays the same', () => {
      const error = new Error('Same');
      const { rerender } = render(<GlobalError error={error} />);

      rerender(<GlobalError error={error} />);

      expect(sentryMocks.captureException).toHaveBeenCalledOnce();
    });
  });

  describe('rendering', () => {
    it('renders html with lang en', () => {
      render(<GlobalError error={new Error('Test')} />);

      expect(document.documentElement).toHaveAttribute('lang', 'en');
    });

    it('renders the Next.js error page', () => {
      render(<GlobalError error={new Error('Test')} />);

      expect(screen.getByTestId('next-error')).toBeInTheDocument();
      expect(screen.getByTestId('next-error')).toHaveAttribute(
        'data-status-code',
        '0',
      );
    });
  });
});
