import { Axiom } from '@axiomhq/js';

import { env } from '@/core/config/env';

export const axiomClient = env.AXIOM_TOKEN
  ? new Axiom({ token: env.AXIOM_TOKEN })
  : undefined;
