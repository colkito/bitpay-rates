// Run `npm run build` first — this imports the built artifact, not src/.
import bitpayRates, { get } from '../dist/index.mjs';

try {
  const rates = await get();
  console.log('[all vs BTC]', rates.slice(0, 3), `… ${rates.length} total`);
} catch (err) {
  console.error('[all vs BTC] Error:', err.message);
}

try {
  const rates = await get({ base: 'ETH' });
  console.log('[all vs ETH]', rates.slice(0, 3), `… ${rates.length} total`);
} catch (err) {
  console.error('[all vs ETH] Error:', err.message);
}

try {
  console.log('[BTC/ARS]', await get({ quote: 'ARS' }));
} catch (err) {
  console.error('[BTC/ARS] Error:', err.message);
}

try {
  console.log('[ETH/USD]', await get({ base: 'ETH', quote: 'USD' }));
} catch (err) {
  console.error('[ETH/USD] Error:', err.message);
}

// The default export is a namespace object, so the v2 import style still works.
try {
  console.log('[default export]', await bitpayRates.get({ quote: 'USD' }));
} catch (err) {
  console.error('[default export] Error:', err.message);
}

// BitPay rejects an unknown code server-side…
try {
  await get({ quote: 'INVALID' });
} catch (err) {
  console.error('[INVALID]', err.message);
}

// …and a code that could steer the URL never leaves the process.
try {
  await get({ quote: '../../api/rates' });
} catch (err) {
  console.error('[traversal]', err.message);
}

// `/rates/USD` answers with a single rate, not a table — the shape check catches it.
try {
  await get({ base: 'USD' });
} catch (err) {
  console.error('[bad base]', err.message);
}
