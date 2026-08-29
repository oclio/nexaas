import '@testing-library/jest-dom/vitest';

vi.mock('next/font/google', () => ({
  Inter: () => ({
    style: { fontFamily: 'inter' },
    className: 'mocked-inter-class',
    variable: '--font-inter-mocked',
  }),
}));
