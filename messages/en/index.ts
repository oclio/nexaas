import type frConfig from '../fr';
import type { TranslationSchema } from '../types';
import components from './components';
import labels from './labels';
import pages from './pages';

const en = {
  components,
  labels,
  pages,
} as const satisfies TranslationSchema<typeof frConfig>;

export default en;
