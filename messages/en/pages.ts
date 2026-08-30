import type pagesFr from '../fr/pages';
import type { TranslationSchema } from '../types';
import pageLanding from './page-landing';

export default {
  ...pageLanding,
} as const satisfies TranslationSchema<typeof pagesFr>;
