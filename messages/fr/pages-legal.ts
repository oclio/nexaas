import type enPagesLegal from '../en/pages-legal';
import type { TranslationSchema } from '../types';

export default {
  cookies: {
    shortTitle: 'Cookies',
  },
  license: {
    title: 'Licence',
  },
  privacy: {
    shortTitle: 'Confidentialité',
  },
  terms: {
    shortTitle: 'Conditions',
  },
} as const satisfies TranslationSchema<typeof enPagesLegal>;
