import '@testing-library/jest-dom/vitest';

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
