import { handleHashScroll } from '@/ui/helpers/handle-hash-scroll';

describe('handleHashScroll', () => {
  let preventDefault: ReturnType<typeof vi.fn>;
  let event_: React.MouseEvent<HTMLAnchorElement>;

  beforeEach(() => {
    vi.clearAllMocks();
    preventDefault = vi.fn();
    event_ = {
      preventDefault,
    } as unknown as React.MouseEvent<HTMLAnchorElement>;
    vi.spyOn(document, 'querySelector').mockReturnValue(null);
    vi.spyOn(history, 'pushState').mockImplementation(() => {
      /*
      noop
      */
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing when href has no hash', () => {
    handleHashScroll(event_, '/about', '/');

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('does nothing when href ends with a bare hash', () => {
    handleHashScroll(event_, '/#', '/');

    expect(preventDefault).not.toHaveBeenCalled();
    expect(document.querySelector).not.toHaveBeenCalled();
  });

  it('does nothing when the target element does not exist', () => {
    vi.spyOn(document, 'querySelector').mockReturnValue(null);

    handleHashScroll(event_, '/#features', '/');

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('does nothing when not on the landing page', () => {
    const element = document.createElement('div');
    vi.spyOn(document, 'querySelector').mockReturnValue(element);

    handleHashScroll(event_, '/#features', '/about');

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('does nothing on a deep path ending with a two-letter segment', () => {
    const element = document.createElement('div');
    vi.spyOn(document, 'querySelector').mockReturnValue(element);

    handleHashScroll(event_, '/#features', '/about/en');

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it.each([
    { pathname: '/', label: 'root' },
    { pathname: '/en', label: 'two-letter locale' },
    { pathname: '/fr', label: 'two-letter locale fr' },
  ])(
    'prevents default, scrolls, and pushes state on $label',
    ({ pathname }) => {
      const element = document.createElement('div');
      const scrollIntoView = vi.fn();
      element.scrollIntoView = scrollIntoView;
      vi.spyOn(document, 'querySelector').mockReturnValue(element);

      handleHashScroll(event_, `/#features`, pathname);

      expect(preventDefault).toHaveBeenCalled();
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
      expect(history.pushState).toHaveBeenCalledWith(
        undefined,
        '',
        '#features',
      );
      expect(document.querySelector).toHaveBeenCalledWith('#features');
    },
  );

  it('calls the callback when provided and scrolling succeeds', () => {
    const element = document.createElement('div');
    element.scrollIntoView = vi.fn();
    vi.spyOn(document, 'querySelector').mockReturnValue(element);
    const callback = vi.fn();

    handleHashScroll(event_, '/#features', '/', callback);

    expect(callback).toHaveBeenCalled();
  });

  it('does not call the callback when scrolling does not happen', () => {
    vi.spyOn(document, 'querySelector').mockReturnValue(null);
    const callback = vi.fn();

    handleHashScroll(event_, '/#features', '/', callback);

    expect(callback).not.toHaveBeenCalled();
  });
});
