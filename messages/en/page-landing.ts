import type pagesLandingFr from '../fr/page-landing';
import type { TranslationSchema } from '../types';

export default {
  landing: {
    title: 'Welcome!',
  },
} as const satisfies TranslationSchema<typeof pagesLandingFr>;
