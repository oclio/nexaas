import { render } from '@testing-library/react';

import { useReportWebVitalsMock } from '@/tests/unit/mocks/observability';

const sendBeaconSpy = vi.fn();
const fetchSpy = vi.fn();

import { WebVitals } from '@/core/observability/axiom/components/web-vitals';

function renderAndTrigger(metric: Record<string, unknown>) {
  render(<WebVitals />);
  const callback = useReportWebVitalsMock.mock.calls.at(-1)?.[0];
  callback?.(metric);
}

describe('WebVitals', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    sendBeaconSpy.mockReset();
    fetchSpy.mockReset();
    useReportWebVitalsMock.mockClear();

    // jsdom doesn't have sendBeacon — define it as a writable property
    Object.defineProperty(navigator, 'sendBeacon', {
      value: sendBeaconSpy,
      configurable: true,
      writable: true,
    });
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    Object.defineProperty(navigator, 'sendBeacon', {
      value: undefined,
      configurable: true,
    });
  });

  it('renders null', () => {
    const { container } = render(<WebVitals />);

    expect(container.firstChild).toBeNull();
  });

  it('calls useReportWebVitals on mount', () => {
    render(<WebVitals />);

    expect(useReportWebVitalsMock).toHaveBeenCalledOnce();
  });

  it('does nothing when NODE_ENV is not production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    renderAndTrigger({ name: 'CLS', value: 0.1 });

    expect(sendBeaconSpy).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('uses sendBeacon when available', () => {
    renderAndTrigger({ name: 'CLS', value: 0.1, id: 'v3-abc' });

    expect(sendBeaconSpy).toHaveBeenCalledOnce();
    expect(sendBeaconSpy).toHaveBeenCalledWith(
      '/api/web-vitals',
      expect.any(Blob),
    );
    const blob = sendBeaconSpy.mock.calls[0][1] as Blob;
    expect(blob.type).toBe('application/json');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('falls back to fetch when sendBeacon is unavailable', () => {
    Object.defineProperty(navigator, 'sendBeacon', {
      value: undefined,
      configurable: true,
    });

    renderAndTrigger({ name: 'LCP', value: 2.5 });

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenCalledWith('/api/web-vitals', {
      body: expect.any(String),
      method: 'POST',
      keepalive: true,
    });
    expect(sendBeaconSpy).not.toHaveBeenCalled();
  });

  it('includes traceId from cookie when present', async () => {
    Object.defineProperty(document, 'cookie', {
      value: 'x-trace-id=abc-123; other=value',
      configurable: true,
    });

    renderAndTrigger({ name: 'FCP', value: 1.2 });

    expect(sendBeaconSpy).toHaveBeenCalledOnce();
    const blob = sendBeaconSpy.mock.calls[0][1] as Blob;
    const text = await blob.text();
    const payload = JSON.parse(text);

    expect(payload.traceId).toBe('abc-123');
    expect(payload.name).toBe('FCP');
  });

  it('extracts traceId when preceded by semicolon and space', async () => {
    Object.defineProperty(document, 'cookie', {
      value: 'other=value; x-trace-id=def-456',
      configurable: true,
    });

    renderAndTrigger({ name: 'FCP', value: 1.2 });

    const blob = sendBeaconSpy.mock.calls[0][1] as Blob;
    const payload = JSON.parse(await blob.text());

    expect(payload.traceId).toBe('def-456');
  });

  it('extracts traceId when preceded by semicolon without space', async () => {
    Object.defineProperty(document, 'cookie', {
      value: 'other=value;x-trace-id=ghi-789',
      configurable: true,
    });

    renderAndTrigger({ name: 'FCP', value: 1.2 });

    const blob = sendBeaconSpy.mock.calls[0][1] as Blob;
    const payload = JSON.parse(await blob.text());

    expect(payload.traceId).toBe('ghi-789');
  });

  it('sets traceId to undefined when cookie is absent', async () => {
    Object.defineProperty(document, 'cookie', {
      value: '',
      configurable: true,
    });

    renderAndTrigger({ name: 'TTFB', value: 50 });

    const blob = sendBeaconSpy.mock.calls[0][1] as Blob;
    const text = await blob.text();
    const payload = JSON.parse(text);

    expect(payload.traceId).toBeUndefined();
    expect(payload.name).toBe('TTFB');
  });
});
