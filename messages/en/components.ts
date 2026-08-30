import type frComponents from '../fr/components';
import type { TranslationSchema } from '../types';

export default {
  localeSwitcher: {
    ariaLabel: 'Change language',
  },
  themeToggle: {
    toggleDark: 'Toggle dark mode',
    toggleLight: 'Toggle light mode',
  },
} as const satisfies TranslationSchema<typeof frComponents>;
