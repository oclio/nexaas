import { readFileSync, writeFileSync } from 'node:fs';

import exclude from '../test-exclude.mjs';

const propsPath = 'sonar-project.properties';
const content = readFileSync(propsPath, 'utf8');

const sonarExclusions = exclude.join(',');
const updated = content.replace(
  /sonar\.coverage\.exclusions=.*/,
  () => `sonar.coverage.exclusions=${sonarExclusions}`,
);

writeFileSync(propsPath, updated);
console.log('Synced sonar.coverage.exclusions from test-exclude.mjs');
