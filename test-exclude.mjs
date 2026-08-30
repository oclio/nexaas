const exclude = [
  '**/*.d.ts',
  'src/**/__e2e__/**',
  'src/**/__tests__/**',
  'src/**/types.ts',
  'src/**/types/**',
  'src/core/config/index.ts',
  'src/core/errors/codes.ts',
  'src/core/errors/index.ts',
  'src/core/helpers/index.ts',
  'src/core/i18n/navigation.ts',
  'src/core/i18n/request.ts',
  'src/core/i18n/routing.ts',
  'src/core/observability/axiom/client.ts',
  'src/core/observability/axiom/server.ts',
  'src/core/security/headers.ts',
  'src/ui/components/shadcn/**',
  'src/ui/fonts/index.ts',
  'src/ui/icons/index.ts',
];

export default exclude;
