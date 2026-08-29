import { withTimeout } from '@/core/async/helpers/with-timeout';
import { env } from '@/core/config/env';
import { axiomClient } from '@/core/observability/axiom/client';

export async function checkAxiomService() {
  if (!axiomClient || !env.AXIOM_DATASET) return { status: 'disabled' };
  try {
    await withTimeout(axiomClient.datasets.get(env.AXIOM_DATASET));
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error: (error as Error).message };
  }
}
