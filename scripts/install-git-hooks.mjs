// Installs this repo's git hooks. Run from `prepare`, so `npm ci` sets them up.
// Node rather than `cp` so it works on Windows. Silent no-op outside a git
// checkout — installing from a tarball has no .git.

import { execFileSync } from 'node:child_process';
import { chmodSync, copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

let gitDir;
try {
  gitDir = execFileSync('git', ['rev-parse', '--absolute-git-dir'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
} catch {
  process.exit(0);
}

const source = join(import.meta.dirname, 'git-hooks');
if (!existsSync(source)) process.exit(0);

const target = join(gitDir, 'hooks');
mkdirSync(target, { recursive: true });

const installed = [];
for (const hook of readdirSync(source)) {
  const dest = join(target, hook);
  copyFileSync(join(source, hook), dest);
  chmodSync(dest, 0o755);
  installed.push(hook);
}

console.log(`installed git hooks: ${installed.join(', ')}`);
