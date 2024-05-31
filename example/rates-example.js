const bitpayRates = require('../dist');

const code = 'ARS';

// Using Promises
bitpayRates
  .get()
  .then((rates) => console.log('[Promise][All] Rates:', rates))
  .catch((err) => console.error('[Promise][All] Error:', err));

bitpayRates
  .get(code)
  .then((rate) => console.log(`[Promise][${code}] Rate:`, rate))
  .catch((err) => console.error(`[Promise][${code}] Error:`, err));
