import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const captureExceptionMock = vi.fn();
vi.mock('@sentry/nextjs', () => ({
  captureException: captureExceptionMock,
}));

const { default: GlobalError } = await import('../global-error');

describe('GlobalError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('captures exception to Sentry on mount', () => {
    const error = new Error('Something went wrong');

    render(<GlobalError error={error} />);

    expect(captureExceptionMock).toHaveBeenCalledWith(error);
    expect(captureExceptionMock).toHaveBeenCalledOnce();
  });

  it('captures exception again when error changes', () => {
    const { rerender } = render(<GlobalError error={new Error('First')} />);

    const secondError = new Error('Second');
    rerender(<GlobalError error={secondError} />);

    expect(captureExceptionMock).toHaveBeenCalledTimes(2);
    expect(captureExceptionMock).toHaveBeenLastCalledWith(secondError);
  });

  it('renders html with lang en', () => {
    render(<GlobalError error={new Error('Test')} />);

    expect(document.documentElement).toHaveAttribute('lang', 'en');
  });

  it('renders the Next.js error page', () => {
    render(<GlobalError error={new Error('Test')} />);

    expect(
      screen.getByText(/Application error: a client-side exception/),
    ).toBeInTheDocument();
  });
});
