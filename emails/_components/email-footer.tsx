import { Hr, Tailwind, Text } from '@react-email/components';

import { app } from '@/core/config';

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
          {app.title}
        </a>
        {` · ${note}`}
      </Text>
    </Tailwind>
  );
}
