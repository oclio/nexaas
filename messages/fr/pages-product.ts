import type enPagesProduct from '../en/pages-product';
import type { TranslationSchema } from '../types';

export default {
  landing: {
    cta: {
      title: 'Commencer',
    },
    description:
      'Arrêtez de débugger en production. Livrez en toute confiance. Une architecture SaaS Next.js aux conventions strictes, renforcée par un testing en profondeur avec mutation et des patterns TypeScript à toute épreuve. Chaque refactor est sûr, chaque déploiement est calme, et vos alertes de 3h du matin restent silencieuses.',
    features: {
      title: 'Fonctionnalités',
    },
    keywords: [
      'ce qui est inclus',
      'fonctionnalités',
      'statistiques',
      'tarifs',
    ],
    pricing: {
      title: 'Tarifs',
    },
    stats: {
      title: 'Statistiques',
    },
    title: 'Bienvenue !',
  },
  whatIsIncluded: {
    description:
      'Le détail complet de tout ce qui est inclus dans {brand} : architecture, modules, outillage, tests et intégrations.',
    keywords: ['architecture', 'fonctionnalités', 'inclus', 'modules'],
    title: 'Ce qui est inclus',
    viewAll: 'Voir toutes les fonctionnalités incluses',
  },
} as const satisfies TranslationSchema<typeof enPagesProduct>;
