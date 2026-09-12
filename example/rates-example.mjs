// Run `npm run build` first — this imports the built artifact, not src/.
import bitpayRates, { get } from '../dist/index.mjs';

const code = 'ARS';

try {
  const rates = await get();
  console.log('[All] Rates:', rates.slice(0, 3), `… ${rates.length} total`);
} catch (err) {
  console.error('[All] Error:', err);
}

try {
  const rate = await get(code);
  console.log(`[${code}] Rate:`, rate);
} catch (err) {
  console.error(`[${code}] Error:`, err);
}

try {
  const rate = await get('USD', 'ETH');
  console.log('[ETH/USD] Rate:', rate);
} catch (err) {
  console.error('[ETH/USD] Error:', err);
}

// The default export is a namespace object, so the v2 style works too.
try {
  const rate = await bitpayRates.get('USD');
  console.log('[default export] Rate:', rate);
} catch (err) {
  console.error('[default export] Error:', err);
}

try {
  const rate = await get('INVALID');
  console.log('[INVALID] Rate:', rate);
} catch (err) {
  console.error('[INVALID] Error:', err.message);
}

// Rejected locally: a code can never steer the URL to another path.
try {
  await get('../../api/rates');
} catch (err) {
  console.error('[traversal] Rejected before any request:', err.message);
}
