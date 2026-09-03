import { render } from '@testing-library/react';

import {
  renderBr,
  renderLink,
  renderSmall,
  renderStrong,
} from '../helpers/render-rich';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
    'data-testid': testId,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    'data-testid'?: string;
  }) => (
    <a href={href} className={className} data-testid={testId}>
      {children}
    </a>
  ),
}));

describe('renderLink', () => {
  it('renders a Link with the given props and chunks as children', () => {
    const renderFunction = renderLink({
      href: 'https://example.com',
      className: 'text-primary',
      'data-testid': 'test-link',
    });

    const { getByTestId } = render(<>{renderFunction('click here')}</>);

    const link = getByTestId('test-link');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('class', 'text-primary');
    expect(link).toHaveTextContent('click here');
  });
});

describe('renderStrong', () => {
  it('renders a strong element with the chunks as children', () => {
    const renderFunction = renderStrong();

    const { container } = render(<>{renderFunction('important text')}</>);

    const strong = container.querySelector('strong');
    expect(strong).not.toBeNull();
    expect(strong).toHaveTextContent('important text');
  });

  it('applies the font-bold class by default', () => {
    const renderFunction = renderStrong();

    const { container } = render(<>{renderFunction('text')}</>);

    expect(container.querySelector('strong')).toHaveClass('font-bold');
  });

  it('merges a custom className with font-bold', () => {
    const renderFunction = renderStrong('text-red-500');

    const { container } = render(<>{renderFunction('text')}</>);

    expect(container.querySelector('strong')).toHaveClass('font-bold');
    expect(container.querySelector('strong')).toHaveClass('text-red-500');
  });
});

describe('renderSmall', () => {
  it('renders a small element with the chunks as children', () => {
    const renderFunction = renderSmall();

    const { container } = render(<>{renderFunction('fine print')}</>);

    const small = container.querySelector('small');
    expect(small).not.toBeNull();
    expect(small).toHaveTextContent('fine print');
  });

  it('applies the given className', () => {
    const renderFunction = renderSmall('text-muted-foreground');

    const { container } = render(<>{renderFunction('text')}</>);

    expect(container.querySelector('small')).toHaveClass(
      'text-muted-foreground',
    );
  });
});

describe('renderBr', () => {
  it('returns a function that renders a br element', () => {
    const renderFunction = renderBr();

    const { container } = render(<>{renderFunction()}</>);

    expect(container.querySelector('br')).not.toBeNull();
  });

  it('returns the same function reference on every call', () => {
    expect(renderBr()).toBe(renderBr());
  });
});
