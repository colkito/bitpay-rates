const bitpayRates = require('../dist');

const code = 'ARS';

// Using Promises
const ratesPromise = bitpayRates.get();
ratesPromise
  .then((rates) => console.log('[Promise][All] Rates:', rates))
  .catch((err) => console.log('[Promise][All] Error:', err));

const ratePromise = bitpayRates.get(code);
ratePromise
  .then((rate) => console.log('[Promise][Code] Rate:', rate))
  .catch((err) => console.log('[Promise][Code] Error:', err));

// Using Callbacks
bitpayRates.get((err, res) => {
  console.log('[Callback][All] Error:', err);
  console.log('[Callback][All] Rates:', res);
});

bitpayRates.get(code, (err, res) => {
  console.log('[Callback][Code] Error:', err);
  console.log('[Callback][Code] Rate:', res);
});
