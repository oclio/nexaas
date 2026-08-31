import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
} from '@react-email/components';
import { ReactNode } from 'react';

import EmailFooter from '@/emails/_components/email-footer';
import EmailHeader from '@/emails/_components/email-header';

interface Properties {
  children: ReactNode;
  preview: string;
  title: string;
  footnote: string;
  locale: string;
}

export default function EmailBody({
  children,
  preview,
  title,
  footnote,
  locale,
}: Readonly<Properties>) {
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-gray-100">
          <Section className="bg-gray-100 font-sans">
            <Container className="my-10 max-w-125 rounded-xl bg-white p-10 shadow-sm">
              <EmailHeader title={title} />
              {children}
              <EmailFooter note={footnote} />
            </Container>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
}
