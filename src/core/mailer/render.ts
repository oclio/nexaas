import { type ComponentType, createElement, type ReactElement } from 'react';

export async function renderTemplate(
  templateName: string,
  props?: Record<string, unknown>,
): Promise<ReactElement> {
  if (!/^[a-zA-Z0-9-]+$/.test(templateName)) {
    throw new Error(`Invalid template name: ${templateName}`);
  }

  const emailModule = await import(`@/emails/${templateName}`);
  const TemplateComponent = emailModule.default as ComponentType<
    Record<string, unknown>
  >;

  return createElement(TemplateComponent, props ?? {});
}
