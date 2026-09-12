import { get } from '../dist/index.mjs';

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

try {
  const rate = await get('INVALID');
  console.log('[INVALID] Rate:', rate);
} catch (err) {
  console.error('[INVALID] Error:', err);
}

try {
  await get('../../api/rates');
} catch (err) {
  console.error('[traversal] Rejected before any request:', err.message);
}
