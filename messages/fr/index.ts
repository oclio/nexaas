import type enConfig from '../en';
import type { TranslationSchema } from '../types';
import components from './components';
import labels from './labels';
import meta from './meta';
import pages from './pages';

const fr = {
  components,
  labels,
  meta,
  pages,
} as const satisfies TranslationSchema<typeof enConfig>;

export default fr;
