/**
 * Packaging smoke test: asserts that the built artifact in dist/ really exposes
 * every import style the README documents. Type checks and unit tests run
 * against src/, so only this catches a broken `exports` map, a wrong default
 * export shape, or a bad dual ESM/CJS build. Runs in CI after the build and
 * again from `prepublishOnly`, so a broken artifact cannot be published.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

// Resolved at runtime rather than as a literal specifier: dist/ does not exist
// on a clean checkout, and `tsc --noEmit` runs before the build.
const dist = (file: string) => new URL(`../dist/${file}`, import.meta.url);

const esm = await import(dist('index.mjs').href);
const cjs = require(fileURLToPath(dist('index.cjs')));

const checks: [string, unknown][] = [
  ["ESM  import { get } from 'bitpay-rates'", esm.get],
  ['ESM  import bitpayRates … bitpayRates.get()', esm.default?.get],
  ["CJS  const { get } = require('bitpay-rates')", cjs.get],
  ['CJS  const bitpayRates = require(…) … bitpayRates.get()', cjs.default?.get],
];

for (const [style, value] of checks) {
  assert.equal(typeof value, 'function', `${style} is not a function`);
  console.log(`✔ ${style}`);
}

assert.equal(esm.get, esm.default?.get, 'ESM named and default export disagree');
assert.equal(cjs.get, cjs.default?.get, 'CJS named and default export disagree');

// No request may leave the process for an invalid code.
await assert.rejects(esm.get('../../api/rates'), TypeError);
console.log('✔ invalid codes reject before any request');
