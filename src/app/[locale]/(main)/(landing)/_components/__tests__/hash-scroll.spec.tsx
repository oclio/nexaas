import { render } from '@testing-library/react';
import { useEffect } from 'react';

import { HashScroll } from '../hash-scroll';

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useEffect: vi.fn(actual.useEffect),
  };
});

describe('HashScroll', () => {
  let scrollIntoView: ReturnType<typeof vi.fn>;
  let locationMock: { hash: string };

  beforeEach(() => {
    scrollIntoView = vi.fn();
    locationMock = { hash: '' };
    vi.spyOn(globalThis, 'location', 'get').mockReturnValue(
      locationMock as unknown as Location,
    );
    vi.spyOn(document, 'querySelector').mockImplementation(
      (selector: string) => {
        if (selector === '#features') {
          return { scrollIntoView } as unknown as Element;
        }
        return null;
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing', () => {
    const { container } = render(<HashScroll />);

    expect(container).toBeEmptyDOMElement();
  });

  it('does not scroll when there is no hash', () => {
    locationMock.hash = '';

    render(<HashScroll />);

    expect(document.querySelector).not.toHaveBeenCalled();
  });

  it('scrolls to the element matching the hash', () => {
    locationMock.hash = '#features';

    render(<HashScroll />);

    expect(document.querySelector).toHaveBeenCalledWith('#features');
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'instant',
      block: 'start',
    });
  });

  it('does not scroll when the element does not exist', () => {
    locationMock.hash = '#unknown';

    render(<HashScroll />);

    expect(document.querySelector).toHaveBeenCalledWith('#unknown');
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('runs the effect only once on mount', () => {
    locationMock.hash = '#features';
    const { rerender } = render(<HashScroll />);

    expect(document.querySelector).toHaveBeenCalledTimes(1);

    rerender(<HashScroll />);

    expect(document.querySelector).toHaveBeenCalledTimes(1);
  });

  it('passes an empty dependency array to useEffect', () => {
    render(<HashScroll />);

    expect(useEffect).toHaveBeenCalledWith(expect.any(Function), []);
  });
});
