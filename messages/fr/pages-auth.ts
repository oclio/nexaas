import type enPagesAuth from '../en/pages-auth';
import type { TranslationSchema } from '../types';

export default {
  authLayout: {
    byContinuing:
      "En poursuivant, vous acceptez nos <terms-of-service>Conditions Générales d'Utilisation</terms-of-service>, notre <privacy-policy>Politique de Confidentialité</privacy-policy> et notre <cookie-policy>Politique de Cookies</cookie-policy>.",
  },
  login: {
    description:
      'Connectez-vous à votre compte {brand} pour accéder à votre tableau de bord, gérer votre abonnement et reprendre là où vous vous êtes arrêté.',
    keywords: ['authentification', 'compte', 'connexion', 'se connecter'],
    title: 'Connexion',
  },
} as const satisfies TranslationSchema<typeof enPagesAuth>;
