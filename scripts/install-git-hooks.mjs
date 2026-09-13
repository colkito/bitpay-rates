// Installs the hooks lefthook does not manage. Run from `prepare`, after
// `lefthook install`, so nothing overwrites anything: lefthook only writes the
// hooks named in lefthook.yml, and pre-push is deliberately not one of them.
//
// Node rather than `cp` so it works on Windows too. Silent no-op outside a git
// checkout — installing from a tarball has no .git to write to.

import { execFileSync } from 'node:child_process';
import { chmodSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const HOOKS = ['pre-push'];

let gitDir;
try {
  gitDir = execFileSync('git', ['rev-parse', '--absolute-git-dir'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
} catch {
  process.exit(0);
}

const target = join(gitDir, 'hooks');
mkdirSync(target, { recursive: true });

for (const hook of HOOKS) {
  const src = join(import.meta.dirname, 'git-hooks', hook);
  if (!existsSync(src)) continue;
  const dest = join(target, hook);
  copyFileSync(src, dest);
  chmodSync(dest, 0o755);
  console.log(`installed git hook: ${hook}`);
}
