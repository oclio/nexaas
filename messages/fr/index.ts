import type enConfig from '../en';
import type { TranslationSchema } from '../types';
import components from './components';
import dashboard from './dashboard';
import emails from './emails';
import forms from './forms';
import labels from './labels';
import meta from './meta';
import pages from './pages';

const fr = {
  components,
  dashboard,
  emails,
  forms,
  labels,
  meta,
  pages,
} as const satisfies TranslationSchema<typeof enConfig>;

export default fr;
