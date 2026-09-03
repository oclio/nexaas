import type enComponents from '../en/components';
import type { TranslationSchema } from '../types';

export default {
  footer: {
    allRightsReserved: 'Tous droits réservés.',
    appOn: '{brand} sur {platform}',
    categories: {
      company: 'Compagnie',
      help: 'Aide',
      legal: 'Légal',
      product: 'Produit',
    },
    description:
      'Oubliez "Production-Ready".<br></br>Construisez sur de l\'incassable.',
  },
  localeSwitcher: {
    ariaLabel: 'Changer de langue',
  },
  logo: {
    alt: '{brand} logo',
  },
  themeToggle: {
    toggleDark: 'Basculer en mode sombre',
    toggleLight: 'Basculer en mode clair',
  },
} as const satisfies TranslationSchema<typeof enComponents>;
