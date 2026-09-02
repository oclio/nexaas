import { isValidElement } from 'react';
import { vi } from 'vitest';

import { renderTemplate } from '../render';

function mockTemplate() {
  return { type: 'div', props: { children: 'Hello' } };
}

const { mockModule } = vi.hoisted(() => ({
  mockModule: { default: mockTemplate },
}));

vi.mock('@/emails/welcome', () => mockModule);
vi.mock('@/emails/otp-code', () => mockModule);
vi.mock('@/emails/my-template', () => mockModule);

describe('renderTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a template by name with props', async () => {
    const result = await renderTemplate('welcome', { name: 'Alice' });

    expect(isValidElement(result)).toBe(true);
    expect(result.type).toBe(mockTemplate);
    expect((result.props as Record<string, unknown>).name).toBe('Alice');
  });

  it('renders without props when none provided', async () => {
    const result = await renderTemplate('otp-code');

    expect(isValidElement(result)).toBe(true);
    expect(result.type).toBe(mockTemplate);
    expect(result.props).toEqual({});
  });

  it('renders with empty props when undefined is passed explicitly', async () => {
    const result = await renderTemplate('otp-code', undefined);

    expect(isValidElement(result)).toBe(true);
    expect(result.props).toEqual({});
  });

  it('renders a template with hyphens', async () => {
    const result = await renderTemplate('my-template');

    expect(isValidElement(result)).toBe(true);
    expect(result.type).toBe(mockTemplate);
  });

  it.each([
    '',
    'welcome!',
    'welcome/index',
    '../secret',
    'welcome template',
    'template@name',
    'template.name',
  ])('throws for invalid template name: %s', async (name) => {
    await expect(renderTemplate(name)).rejects.toThrow(
      `Invalid template name: ${name}`,
    );
  });
});
