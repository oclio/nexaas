# Mailer

nexaas sends transactional emails via [Resend](https://resend.com) with [React Email](https://react.email) templates. Templates are authored with Tailwind CSS classes and previewed locally with the `email dev` server.

## Configuration

| Variable         | Required | Description                                                                    |
| ---------------- | -------- | ------------------------------------------------------------------------------ |
| `RESEND_API_KEY` | Yes      | Resend API key. Get one at [resend.com/api-keys](https://resend.com/api-keys). |
| `EMAIL_FROM`     | Yes      | Sender address in the format `Name <email@domain.com>`.                        |

Add them to `.env`:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=nexaas <noreply@nexaas.dev>
```

## File structure

| File           | Purpose                                                    |
| -------------- | ---------------------------------------------------------- |
| `client.ts`    | Creates a Resend client instance with the API key from env |
| `render.ts`    | Renders a named React Email template to a React element    |
| `whitelist.ts` | Filters recipients against the email whitelist             |
| `mailer.ts`    | Orchestrates the send: content selection, logging, errors  |
| `types.ts`     | Shared types (`SendEmailOptions`, `MailerResult`)          |

## Sending an email

```ts
import { sendEmail } from '@/core/mailer';

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<p>Hello!</p>',
});
```

### Content options

`sendEmail` accepts one of three content types:

| Option     | Type           | Description                                                     |
| ---------- | -------------- | --------------------------------------------------------------- |
| `html`     | `string`       | Raw HTML string                                                 |
| `react`    | `ReactElement` | A React Email element (rendered to HTML)                        |
| `template` | `string`       | Name of a template in `emails/` (rendered via `renderTemplate`) |

If `template` is provided, `props` is passed to the template as props.

```ts
await sendEmail({
  to: 'user@example.com',
  subject: 'Confirm your subscription',
  template: 'newsletter-confirmation',
  props: { url, token, locale, labels },
});
```

### Recipients

`to` accepts a single email or an array. All recipients are filtered through `filterRecipients()` which checks the [email whitelist](./security#email-whitelist). Unauthorized recipients are silently dropped and logged.

If no recipients remain after filtering, the send is skipped and `{ id: 'skipped' }` is returned without calling the Resend API.

### Prevent threading

Set `preventThreading: true` to add an `X-Entity-Ref-ID` header. This prevents email clients from grouping messages into threads — useful for one-time codes or notifications.

```ts
await sendEmail({
  to: 'user@example.com',
  subject: 'Your code',
  html: '<p>123456</p>',
  preventThreading: true,
});
```

## Templates

Email templates live in the `emails/` directory and use [React Email](https://react.email) components with Tailwind CSS.

### Structure

```text
emails/
  _components/          → shared layout (header, body, footer)
  static/               → static assets served by the preview server
  newsletter-confirmation.tsx
```

### Preview server

```bash
pnpm email:dev
```

Starts the React Email preview at `http://localhost:3001` (or 3000 if free). Templates are hot-reloaded on save.

::: tip
Static assets for the preview server go in `emails/static/`. Reference them as `/static/logo.png` in templates. In production, use a public URL instead.
:::

### Tailwind CSS

Templates use the `<Tailwind>` component from `@react-email/components` to inline Tailwind classes at render time. No external CSS, no build step — styles are converted to inline styles compatible with all email clients.

```tsx
import { Tailwind, Text } from '@react-email/components';

<Tailwind>
  <Text className="text-base text-gray-600">Hello!</Text>
</Tailwind>;
```

::: warning
Use `text-center` and `mx-auto` for alignment instead of `flex`. Flexbox is poorly supported in email clients (especially Outlook).
:::

### Creating a template

1. Create a `.tsx` file in `emails/` (e.g. `emails/welcome.tsx`)
2. Use `EmailBody` from `emails/_components/email-body` for the shared layout
3. Export a component with typed props
4. Register it in `src/core/mailer/render.ts` if you want to send it via `template: 'welcome'`

```tsx
import { Button, Tailwind, Text } from '@react-email/components';

import EmailBody from '@/emails/_components/email-body';

interface Properties {
  url: string;
  locale: string;
}

export default function Welcome({ url, locale }: Readonly<Properties>) {
  return (
    <EmailBody
      locale={locale}
      preview="Welcome"
      title="Welcome"
      footnote="The team"
    >
      <Tailwind>
        <Text className="text-gray-600">Welcome aboard!</Text>
        <Button href={url}>Get started</Button>
      </Tailwind>
    </EmailBody>
  );
}
```

## Observability

All email operations are logged to Axiom with structured events:

| Event                       | Level | When                                     |
| --------------------------- | ----- | ---------------------------------------- |
| `mailer.send.skipped`       | info  | No authorized recipients after filtering |
| `mailer.resend.success`     | info  | Email sent successfully                  |
| `mailer.resend.error`       | error | Resend API threw an exception            |
| `mailer.resend.failed`      | error | Resend API returned an error response    |
| `mailer.recipients.blocked` | warn  | One or more recipients were filtered out |

Errors are also captured by Sentry with `tags: { service: 'resend' }`.

## Result

`sendEmail` returns a `MailerResult`:

```ts
type MailerResult = { id: string };
```

- On success: `{ id: 'msg-...' }` (the Resend message ID)
- On skip: `{ id: 'skipped' }`
- On missing ID: `{ id: 'unknown' }`
- On error: throws (does not return)
