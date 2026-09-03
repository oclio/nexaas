import type enPagesHelp from '../en/pages-help';
import type { TranslationSchema } from '../types';

export default {
  contact: {
    title: 'Contact',
  },
  documentation: {
    title: 'Documentation',
  },
  faq: {
    description:
      'Trouvez les réponses aux questions fréquentes sur {brand} : fonctionnalités, tarifs, déploiement, personnalisation et support.',
    keywords: ['aide', 'faq', 'questions', 'support'],
    shortTitle: 'FAQ',
    title: 'Questions posées fréquemment',
    viewAll: 'Voir toutes les questions',
  },
  help: {
    shortTitle: 'Aide',
  },
} as const satisfies TranslationSchema<typeof enPagesHelp>;
