import { render } from '@testing-library/react';

import { WebVitals } from '@/core/observability/axiom/components/web-vitals';
import { useReportWebVitalsMock } from '@/tests/unit/mocks/observability';

const ENDPOINT = '/api/web-vitals';
const sendBeaconSpy = vi.fn();
const fetchSpy = vi.fn();

function renderAndTrigger(metric: Record<string, unknown>) {
  render(<WebVitals />);
  const callback = useReportWebVitalsMock.mock.calls.at(-1)?.[0];
  expect(callback).toBeDefined();
  callback(metric);
}

describe('WebVitals', () => {
  let originalCookieDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    sendBeaconSpy.mockReset();
    fetchSpy.mockReset();
    useReportWebVitalsMock.mockClear();
    originalCookieDescriptor = Object.getOwnPropertyDescriptor(
      document,
      'cookie',
    );

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
    if (originalCookieDescriptor) {
      Object.defineProperty(document, 'cookie', originalCookieDescriptor);
    }
  });

  it('renders null', () => {
    const { container } = render(<WebVitals />);

    expect(container.firstChild).toBeNull();
  });

  it('calls useReportWebVitals on mount', () => {
    render(<WebVitals />);

    expect(useReportWebVitalsMock).toHaveBeenCalled();
  });

  it('does nothing when NODE_ENV is not production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    renderAndTrigger({ name: 'CLS', value: 0.1 });

    expect(sendBeaconSpy).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('uses sendBeacon when available', () => {
    renderAndTrigger({ name: 'CLS', value: 0.1, id: 'v3-abc' });

    expect(sendBeaconSpy).toHaveBeenCalledWith(ENDPOINT, expect.any(Blob));
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

    expect(fetchSpy).toHaveBeenCalledWith(ENDPOINT, {
      body: expect.any(String),
      method: 'POST',
      keepalive: true,
    });
    expect(sendBeaconSpy).not.toHaveBeenCalled();
  });

  it.each<{
    name: string;
    cookie: string;
    expectedTraceId: string;
  }>([
    {
      name: 'includes traceId when cookie starts with it',
      cookie: 'x-trace-id=abc-123; other=value',
      expectedTraceId: 'abc-123',
    },
    {
      name: 'extracts traceId when preceded by semicolon and space',
      cookie: 'other=value; x-trace-id=def-456',
      expectedTraceId: 'def-456',
    },
    {
      name: 'extracts traceId when preceded by semicolon without space',
      cookie: 'other=value;x-trace-id=ghi-789',
      expectedTraceId: 'ghi-789',
    },
  ])('$name', async ({ cookie, expectedTraceId }) => {
    Object.defineProperty(document, 'cookie', {
      value: cookie,
      configurable: true,
    });

    renderAndTrigger({ name: 'FCP', value: 1.2 });

    const blob = sendBeaconSpy.mock.calls[0][1] as Blob;
    const payload = JSON.parse(await blob.text());

    expect(payload.traceId).toBe(expectedTraceId);
  });

  it('sets traceId to undefined when cookie is absent', async () => {
    Object.defineProperty(document, 'cookie', {
      value: '',
      configurable: true,
    });

    renderAndTrigger({ name: 'TTFB', value: 50 });

    const blob = sendBeaconSpy.mock.calls[0][1] as Blob;
    const payload = JSON.parse(await blob.text());

    expect(payload.traceId).toBeUndefined();
    expect(payload.name).toBe('TTFB');
  });
});
