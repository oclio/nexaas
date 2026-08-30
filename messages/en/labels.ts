import type frLabels from '../fr/labels';
import type { TranslationSchema } from '../types';

export default {
  back: 'Back',
  backToHome: 'Back to home',
  home: 'Home',
  loading: 'Loading',
  login: 'Log in',
  logout: 'Log out',
  menu: 'Menu',
} as const satisfies TranslationSchema<typeof frLabels>;
