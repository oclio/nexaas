import { Heading, Img, Section, Tailwind, Text } from '@react-email/components';

import { brand } from '@/config/brand';

interface Properties {
  title: string;
}

export default function EmailHeader({ title }: Readonly<Properties>) {
  return (
    <Tailwind>
      <Section className="text-center">
        <Img
          src="/static/logo.png"
          width="45"
          height="45"
          alt="Logo"
          className="mx-auto mb-2"
        />
        <Text className="-mt-1 text-center text-xl font-light">
          {brand.title}
        </Text>
      </Section>

      <Heading className="my-5 text-center text-2xl font-medium">
        {title}
      </Heading>
    </Tailwind>
  );
}
