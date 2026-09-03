---
'saaskip': 'minor'
---

Changed `createPageMetadata` to accept `{ locale, namespace, path }` explicitly instead of reading `headers()`. This enables static prerendering (SSG) for all pages — landing, FAQ, and what's included are now generated as static HTML at build time instead of server-rendered on demand.
