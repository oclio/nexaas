import meta from '@/../messages/en/meta';
import { app } from '@/config';
import { env } from '@/core/env';

export function websiteJsonLd() {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: app.title,
    url: baseUrl,
    description: meta.description,
    publisher: {
      '@type': 'Organization',
      name: app.title,
      url: baseUrl,
    },
  };
}

export function organizationJsonLd() {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: app.title,
    url: baseUrl,
    logo: `${baseUrl}/images/logo-512.png`,
    email: app.author.email,
    sameAs: [app.author.url, `https://twitter.com/${app.author.twitter}`],
  };
}

interface JsonLdScriptProps {
  data: Record<string, unknown>;
}

export function JsonLdScript({ data }: Readonly<JsonLdScriptProps>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
