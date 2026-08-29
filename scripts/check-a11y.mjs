#!/usr/bin/env node

import { execSync } from 'node:child_process';

const BASE_URL = 'http://localhost:3000';
const cliArguments = process.argv.slice(2);

if (cliArguments.length === 0) {
  console.error('Usage: pnpm check:a11y /fr/login /en/cookie-policy ...');
  console.error('       pnpm check:a11y http://localhost:3000/fr/login');
  process.exit(1);
}

const urls = cliArguments.map((argument) =>
  argument.startsWith('http') ? argument : `${BASE_URL}${argument}`,
);

const command = `axe ${urls.join(' ')} --exit`;
console.log(`Running: ${command}`);

try {
  execSync(command, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PATH: `node_modules/.bin:${process.env.PATH}`,
    },
  });
} catch {
  process.exit(1);
}
