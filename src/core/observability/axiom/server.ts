import { AxiomJSTransport, ConsoleTransport, Logger } from '@axiomhq/logging';
import { nextJsFormatters } from '@axiomhq/nextjs';

import { env } from '@/core/config/env';
import { axiomClient } from '@/core/observability/axiom/client';

export const logger = new Logger({
  transports: [
    new ConsoleTransport(),
    ...(axiomClient && env.AXIOM_DATASET
      ? [
          new AxiomJSTransport({
            axiom: axiomClient,
            dataset: env.AXIOM_DATASET,
          }),
        ]
      : []),
  ],
  logLevel: env.LOG_LEVEL,
  formatters: nextJsFormatters,
});
