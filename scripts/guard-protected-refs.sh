#!/usr/bin/env bash
# Blocks anything that could put code on main without a human, for any agent.
#
#   pre-push   git's own hook protocol — refs arrive on stdin. Tool-agnostic:
#              it fires for Claude Code, Copilot, Cursor, Codex, Aider, a plain
#              shell, whatever pushes from this clone. Installed by `npm ci`
#              via scripts/install-git-hooks.mjs, deliberately NOT by lefthook:
#              lefthook consumes git's stdin to build {push_files}, so a command
#              under it never learns which refs are being pushed (verified).
#              Needs nothing but bash and git.
#   pretooluse Claude Code PreToolUse JSON on stdin. Same rules, but earlier and
#              with a readable message, and it also covers what git never sees:
#              merging a PR, publishing a release, publishing to the registry.
#              Needs jq; exits allow if jq is missing, since pre-push still
#              covers every actual push.
#
# Neither is the enforcement boundary — branch protection on main and a
# credential without merge rights are. These make the mistake loud and early.
set -uo pipefail

PROTECTED='main master'

is_protected() {
  local ref="${1#refs/heads/}" p
  for p in $PROTECTED; do [ "$ref" = "$p" ] && return 0; done
  return 1
}

# --- git pre-push -----------------------------------------------------------
# stdin: <local ref> <local sha> <remote ref> <remote sha>, one line per ref.
mode_pre_push() {
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

# --- Claude Code PreToolUse -------------------------------------------------
mode_pretooluse() {
  command -v jq >/dev/null 2>&1 || exit 0

  local cmd
  cmd="$(jq -r '.tool_input.command // empty')"
  [ -z "$cmd" ] && exit 0

  deny() {
    jq -nc --arg r "$1" '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: $r
      }
    }'
    exit 0
  }

  # Destination of a refspec: drop a leading '+', keep what follows the last
  # ':', drop refs/heads/. So "fix/main-thing" stays itself, "HEAD:main" is main.
  refspec_dest() {
    local spec="${1#+}"
    [ "$spec" != "${spec#*:}" ] && spec="${spec##*:}"
    printf '%s' "${spec#refs/heads/}"
  }

  # Inspect each command-let separately and match only at its start. Scanning
  # the whole string for loose tokens misfires on any command that merely
  # mentions one — a heredoc documenting these rules, a commit message, a grep
  # pattern. (That false positive is not hypothetical: it blocked the very
  # commit that introduced this comment.) Quoting is not parsed; this is a
  # guardrail for the obvious spelling, and pre-push catches a real push
  # however it is written.
  local segment tok operands dest branch
  while IFS= read -r segment; do
    # shellcheck disable=SC2086
    set -- $segment
    while [ $# -gt 0 ]; do
      case "$1" in
        *=*) shift ;;
        sudo | command | time | nohup) shift ;;
        *) break ;;
      esac
    done
    [ $# -eq 0 ] && continue

    case "$1" in
      npm | pnpm | yarn | bun)
        shift
        while [ $# -gt 0 ] && [ "${1#-}" != "$1" ]; do shift; done
        [ "${1:-}" = publish ] &&
          deny 'Publishing to the registry is a human step: publishing the draft GitHub Release is what deploys. See AGENTS.md.'
        ;;

      gh)
        shift
        while [ $# -gt 0 ] && [ "${1#-}" != "$1" ]; do shift; done
        case "${1:-}" in
          pr)
            shift
            while [ $# -gt 0 ] && [ "${1#-}" != "$1" ]; do shift; done
            [ "${1:-}" = merge ] &&
              deny 'Merging is the human authorization step. Ask for it instead of running it. See AGENTS.md.'
            ;;
          release)
            shift
            while [ $# -gt 0 ] && [ "${1#-}" != "$1" ]; do shift; done
            case "${1:-}" in
              create | edit | delete)
                deny 'Publishing a GitHub Release triggers the deploy. That click is the human gate. See AGENTS.md.'
                ;;
            esac
            ;;
          api)
            case "$segment" in
              *pulls/*/merge* | *'/merges'*)
                deny 'Merging through the API is still merging, and that is the human step. See AGENTS.md.'
                ;;
            esac
            case "$segment" in
              *'/protection'*)
                case "$segment" in
                  *-X\ PUT* | *-X\ POST* | *-X\ PATCH* | *-X\ DELETE* | *--method*)
                    deny 'Changing branch protection is a human step: it is the boundary this harness rests on.'
                    ;;
                esac
                ;;
            esac
            ;;
        esac
        ;;

      git)
        shift
        while [ $# -gt 0 ]; do
          case "$1" in
            -C | -c | --git-dir | --work-tree | --namespace | --exec-path) shift 2 ;;
            -*) shift ;;
            *) break ;;
          esac
        done
        [ "${1:-}" = push ] || continue
        shift

        operands=0
        while [ $# -gt 0 ]; do
          tok="$1"
          shift
          case "$tok" in
            --all | --mirror)
              deny "git push $tok would include main. Push the feature branch by name."
              ;;
            -o | --push-option | --exec | --receive-pack | --repo) shift ;;
            -*) ;;
            *)
              operands=$((operands + 1))
              if [ "$operands" -gt 1 ]; then
                dest="$(refspec_dest "$tok")"
                is_protected "$dest" &&
                  deny "Pushing to '$dest' is blocked. Agents open pull requests; a human merges. See AGENTS.md."
              fi
              ;;
          esac
        done

        # No refspec means the current branch, so judge it by HEAD.
        if [ "$operands" -le 1 ]; then
          branch="$(git symbolic-ref --quiet --short HEAD 2>/dev/null || printf '')"
          [ -n "$branch" ] && is_protected "$branch" &&
            deny "HEAD is on '$branch', so a bare 'git push' would push it. Switch to a feature branch first."
        fi
        ;;
    esac
  done <<<"$(printf '%s' "$cmd" | sed -E 's/(\|\||&&|[;&|()])/\n/g')"

  exit 0
}

case "${1:-}" in
  pre-push) mode_pre_push ;;
  pretooluse) mode_pretooluse ;;
  *)
    printf 'usage: %s pre-push|pretooluse\n' "$0" >&2
    exit 2
    ;;
esac
