import { Hr, Tailwind, Text } from '@react-email/components';

import { brand } from '@/config/brand';

interface Properties {
  note: string;
}

export default function EmailFooter({ note }: Readonly<Properties>) {
  return (
    <Tailwind>
      <Hr className="my-10 border-gray-200" />

      <Text className="text-center text-xs text-gray-400">
        © {new Date().getFullYear()} &middot;{' '}
        <a href="https://oclio.dev" target="_blank">
          {brand.title}
        </a>
        {` · ${note}`}
      </Text>
    </Tailwind>
  );
}
