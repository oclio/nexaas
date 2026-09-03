import type enComponents from '../en/components';
import type { TranslationSchema } from '../types';

export default {
  footer: {
    categories: {
      company: 'Entreprise',
      help: 'Aide',
      legal: 'Légal',
      product: 'Produit',
    },
  },
  localeSwitcher: {
    ariaLabel: 'Changer de langue',
  },
  logo: {
    alt: '{app} logo',
  },
  themeToggle: {
    toggleDark: 'Basculer en mode sombre',
    toggleLight: 'Basculer en mode clair',
  },
} as const satisfies TranslationSchema<typeof enComponents>;
