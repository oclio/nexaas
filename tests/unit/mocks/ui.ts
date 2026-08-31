import { vi } from 'vitest';

Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('next/font/google', () => ({
  Inter: () => ({
    style: { fontFamily: 'inter' },
    className: 'mocked-inter-class',
    variable: '--font-inter-mocked',
  }),
  Montserrat: () => ({
    style: { fontFamily: 'montserrat' },
    className: 'mocked-montserrat-class',
    variable: '--font-heading-mocked',
  }),
}));

const themeReference = { current: 'light' as string | undefined };
const setThemeMock = vi.fn();

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  NextThemesProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ theme: themeReference.current, setTheme: setThemeMock }),
}));

export { setThemeMock, themeReference as themeRef };
