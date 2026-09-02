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
    pricing: {
      title: 'Tarifs',
    },
    stats: {
      title: 'Statistiques',
    },
    title: 'Bienvenue !',
  },
  whatIsIncluded: {
    title: 'Ce qui est inclus',
  },
} as const satisfies TranslationSchema<typeof enPagesProduct>;
