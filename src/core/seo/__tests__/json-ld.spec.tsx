import { render } from '@testing-library/react';

import meta from '@/../messages/en/meta';
import { brand } from '@/config/brand';
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

    expect(result.name).toBe(brand.title);
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
    expect(publisher.name).toBe(brand.title);
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

    expect(result.name).toBe(brand.title);
  });

  it('uses the app url as url', () => {
    const result = organizationJsonLd();

    expect(result.url).toBe(env.NEXT_PUBLIC_APP_URL);
  });

  it('points to a logo url based on the app url', () => {
    const result = organizationJsonLd();

    expect(result.logo).toContain(env.NEXT_PUBLIC_APP_URL);
    expect(result.logo).toBeTruthy();
  });

  it('uses the author email', () => {
    const result = organizationJsonLd();

    expect(result.email).toBe(brand.author.email);
  });

  it('declares sameAs with author url and twitter', () => {
    const result = organizationJsonLd();
    const sameAs = result.sameAs as string[];

    expect(sameAs).toContain(brand.author.url);
    expect(sameAs).toContain(`https://twitter.com/${brand.author.twitter}`);
  });
});

describe('JsonLdScript', () => {
  it('renders a script tag with the ld+json type', () => {
    const { container } = render(<JsonLdScript data={{ foo: 'bar' }} />);
    const scripts = container.querySelectorAll('script');

    expect(scripts).toHaveLength(1);
    expect(scripts[0]?.getAttribute('type')).toBe('application/ld+json');
  });

  it('serializes the data as json in the script body', () => {
    const data = { '@type': 'WebSite', name: 'saaskip' };
    const { container } = render(<JsonLdScript data={data} />);
    const scripts = container.querySelectorAll('script');

    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toHaveTextContent(JSON.stringify(data));
  });
});
