# Security policy

## Supported versions

Only the latest `3.x` release is supported. Fixes are not backported.

## Reporting a vulnerability

Report privately through
[GitHub Security Advisories](https://github.com/colkito/bitpay-rates/security/advisories/new).
Please do not open a public issue for an unfixed vulnerability.

Expect an acknowledgement within 7 days.

## Supply-chain posture

This package is deliberately small, and the guarantees below are the point of
keeping it that way:

- **Zero runtime dependencies.** Installing `bitpay-rates` adds no transitive
  code to your tree.
- **Published from CI only**, via npm Trusted Publishing (OIDC) — there is no
  long-lived npm token to leak. Every release carries a
  [provenance attestation](https://docs.npmjs.com/generating-provenance-statements).
- **The tarball is only `dist/`** (plus `package.json`, `README.md`, `LICENSE`).
- **No publish is unattended.** A human merges the release PR and then publishes
  the draft GitHub Release; that click is what triggers the npm deploy.
- **No dependency runs code at install time.** `.npmrc` sets
  `strict-allow-scripts=true`, so an unreviewed install script fails the
  install instead of running.
- **GitHub Actions are pinned by commit SHA** and audited by
  [zizmor](https://docs.zizmor.sh/) in CI.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full release flow.
