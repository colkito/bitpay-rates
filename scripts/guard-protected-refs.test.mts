import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const HOOK = fileURLToPath(new URL('./guard-protected-refs.sh', import.meta.url));
const SHA = 'a'.repeat(40);
const ZERO = '0'.repeat(40);

/**
 * Feed the hook exactly what git writes to a pre-push hook's stdin.
 *
 * Synchronous on purpose: the async `execFile` ignores `input`, so the child's
 * stdin never closes and the hook's `read` loop waits forever.
 */
function push(...refs: [local: string, remote: string][]) {
  const input = refs.map(([local, remote]) => `${local} ${SHA} ${remote} ${ZERO}\n`).join('');
  try {
    execFileSync('bash', [HOOK], { input, stdio: ['pipe', 'pipe', 'pipe'], timeout: 10_000 });
    return { blocked: false, message: '' };
  } catch (err) {
    const { status, stderr } = err as { status: number; stderr: Buffer };
    return { blocked: status === 1, message: String(stderr) };
  }
}

describe('pre-push guard', () => {
  it('allows a feature branch', () => {
    assert.equal(push(['refs/heads/feat/x', 'refs/heads/feat/x']).blocked, false);
  });

  it('allows branches whose name merely contains a protected one', () => {
    for (const ref of [
      'refs/heads/feature/main',
      'refs/heads/main-backup',
      'refs/heads/fix/main-menu',
      'refs/heads/mastermind',
    ]) {
      assert.equal(push(['refs/heads/x', ref]).blocked, false, `${ref} should be allowed`);
    }
  });

  it('allows a tag', () => {
    assert.equal(push(['refs/tags/v3.0.0', 'refs/tags/v3.0.0']).blocked, false);
  });

  it('blocks main whatever the local ref is', () => {
    for (const local of ['refs/heads/main', 'refs/heads/other', 'HEAD']) {
      const { blocked, message } = push([local, 'refs/heads/main']);
      assert.equal(blocked, true, `${local} -> main should be blocked`);
      assert.match(message, /Refusing to push main/);
    }
  });

  it('blocks master', () => {
    assert.equal(push(['refs/heads/x', 'refs/heads/master']).blocked, true);
  });

  it('blocks deleting a protected branch', () => {
    // git sends the zero sha as the local sha for a delete.
    assert.equal(push(['(delete)', 'refs/heads/main']).blocked, true);
  });

  it('blocks a batch where only one ref is protected', () => {
    const { blocked } = push(
      ['refs/heads/a', 'refs/heads/a'],
      ['refs/heads/b', 'refs/heads/main'],
      ['refs/heads/c', 'refs/heads/c'],
    );
    assert.equal(blocked, true);
  });

  it('allows an empty push (nothing to do)', () => {
    assert.equal(push().blocked, false);
  });

  it('points at the documented escape hatch', () => {
    const { message } = push(['refs/heads/x', 'refs/heads/main']);
    assert.match(message, /--no-verify/);
    assert.match(message, /AGENTS\.md/);
  });
});
