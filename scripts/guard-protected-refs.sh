#!/usr/bin/env bash
# git pre-push hook: refuse to push a protected branch.
#
# Reads git's own hook protocol, so it fires for whatever pushes from this
# clone — Claude Code, Copilot, Cursor, Codex, a plain shell — and it sees the
# real refspec however the command was spelled (`eval`, `sh -c`, `npx git`).
# Needs nothing but bash and git. Installed by `npm ci`; see
# scripts/install-git-hooks.mjs.
#
# This is not a security control. `--no-verify` skips it, and it says nothing
# about publishing. The boundary is branch protection on main (with
# enforce_admins), a credential without merge rights, and npm Trusted
# Publishing bound to one workflow. This only makes the common mistake fail
# early and legibly. See scripts/guard-protected-refs.test.mts.
set -uo pipefail

PROTECTED='main master'

is_protected() {
  local ref="${1#refs/heads/}" p
  for p in $PROTECTED; do [ "$ref" = "$p" ] && return 0; done
  return 1
}

# stdin: <local ref> <local sha> <remote ref> <remote sha>, one line per ref.
main() {
  local local_ref local_sha remote_ref remote_sha
  while read -r local_ref local_sha remote_ref remote_sha; do
    [ -z "${remote_ref:-}" ] && continue
    if is_protected "$remote_ref"; then
      printf '\n  x Refusing to push %s.\n' "${remote_ref#refs/heads/}" >&2
      printf '    Open a pull request instead; a human merges it. See AGENTS.md.\n' >&2
      printf '    Maintainer doing this on purpose: git push --no-verify\n\n' >&2
      exit 1
    fi
  done
  exit 0
}

main
