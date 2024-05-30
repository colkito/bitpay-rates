import { RequestOptions } from 'https';

export type RateObj = {
  code: string;
  name: string;
  rate: number;
};

export type RateResponse = RateObj | [RateObj];

const defaultOptions: RequestOptions = {
  host: 'bitpay.com',
  path: '/rates',
  headers: {},
  agent: false,
};

/**
 * @param {string} [code] - The currency code.
 * @param {Callback} [callback] - A callback function. (deprecated, use promises instead)
 * @returns {Promise<RateResponse>} - A promise that resolves to the exchange rate data.
 * @deprecated The callback parameter is deprecated. Use promises instead.
 */
/**
 * @param {string} [code] - The currency code.
 * @param {Callback} [callback] - A callback function. (deprecated, use promises instead)
 * @returns {Promise<RateResponse>} - A promise that resolves to the exchange rate data.
 * @deprecated The callback parameter is deprecated. Use promises instead.
 */
export const get = (
  code?: string | Callback,
  callback?: Callback,
): Promise<RateResponse> | void => {
  const options = { ...defaultOptions };
  if (typeof code === 'string') {
    options.path += `/${code.toUpperCase()}`;
  }
  if (typeof code === 'function') {
    console.warn('Warning: Callbacks are deprecated. Use promises instead.');
    return returnCallback(options, code);
  } else if (callback) {
    console.warn('Warning: Callbacks are deprecated. Use promises instead.');
    return returnCallback(options, callback);
  } else {
    return returnPromise(options);
  }
};

export default { get };
