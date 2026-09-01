import { withIntl } from '@/core/i18n/middlewares/with-intl';
import type { CustomMiddleware } from '@/core/middlewares/types';
import { withAxiom } from '@/core/observability/axiom/middlewares/with-axiom';
import { withArcjet } from '@/core/security/arcjet/middlewares/with-arcjet';
import { withBodySizeLimit } from '@/core/security/body/middlewares/with-body-size-limit';
import { withSecureCookies } from '@/core/security/cookies/middlewares/with-secure-cookies';
import { withCsp } from '@/core/security/csp/middlewares/with-csp';
import { withCsrf } from '@/core/security/csrf/middlewares/with-csrf';
import { withSeo } from '@/core/seo/middlewares/with-seo';

const stack: CustomMiddleware[] = [
  withIntl,
  withSeo,
  withAxiom,
  withCsp,
  withCsrf,
  withBodySizeLimit,
  withArcjet,
  withSecureCookies,
];

export default stack;
