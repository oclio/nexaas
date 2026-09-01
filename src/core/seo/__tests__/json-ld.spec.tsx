import { render } from '@testing-library/react';

import meta from '@/../messages/en/meta';
import { app } from '@/config';
import { env } from '@/core/env';

import { JsonLdScript, organizationJsonLd, websiteJsonLd } from '../json-ld';

describe('websiteJsonLd', () => {
  it('declares the schema.org context', () => {
    const result = websiteJsonLd();

    expect(result['@context']).toBe('https://schema.org');
  });

  it('declares the WebSite type', () => {
    const result = websiteJsonLd();

    expect(result['@type']).toBe('WebSite');
  });

  it('uses the app title as name', () => {
    const result = websiteJsonLd();

    expect(result.name).toBe(app.title);
  });

  it('uses the app url as url', () => {
    const result = websiteJsonLd();

    expect(result.url).toBe(env.NEXT_PUBLIC_APP_URL);
  });

  it('uses the english meta description', () => {
    const result = websiteJsonLd();

    expect(result.description).toBe(meta.description);
  });

  it('declares the publisher as an Organization', () => {
    const result = websiteJsonLd();
    const publisher = result.publisher as Record<string, string>;

    expect(publisher['@type']).toBe('Organization');
    expect(publisher.name).toBe(app.title);
    expect(publisher.url).toBe(env.NEXT_PUBLIC_APP_URL);
  });
});

describe('organizationJsonLd', () => {
  it('declares the schema.org context', () => {
    const result = organizationJsonLd();

    expect(result['@context']).toBe('https://schema.org');
  });

  it('declares the Organization type', () => {
    const result = organizationJsonLd();

    expect(result['@type']).toBe('Organization');
  });

  it('uses the app title as name', () => {
    const result = organizationJsonLd();

    expect(result.name).toBe(app.title);
  });

  it('uses the app url as url', () => {
    const result = organizationJsonLd();

    expect(result.url).toBe(env.NEXT_PUBLIC_APP_URL);
  });

  it('points to the png logo', () => {
    const result = organizationJsonLd();

    expect(result.logo).toBe(`${env.NEXT_PUBLIC_APP_URL}/images/logo-512.png`);
  });

  it('uses the author email', () => {
    const result = organizationJsonLd();

    expect(result.email).toBe(app.author.email);
  });

  it('declares sameAs with author url and twitter', () => {
    const result = organizationJsonLd();

    expect(result.sameAs).toEqual([
      app.author.url,
      `https://twitter.com/${app.author.twitter}`,
    ]);
  });
});

describe('JsonLdScript', () => {
  it('renders a script tag with the ld+json type', () => {
    const { container } = render(<JsonLdScript data={{ foo: 'bar' }} />);
    const script = container.querySelector('script');

    expect(script?.getAttribute('type')).toBe('application/ld+json');
  });

  it('serializes the data as json in the script body', () => {
    const data = { '@type': 'WebSite', name: 'nexaas' };
    const { container } = render(<JsonLdScript data={data} />);
    const script = container.querySelector('script');

    expect(script?.getHTML()).toBe(JSON.stringify(data));
  });
});
