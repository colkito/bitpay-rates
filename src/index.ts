/**
 * Import the `RequestOptions` type from the `https` module.
 * Using `import type` ensures better runtime safety.
 */
import https, { type RequestOptions } from 'https';

/**
 * Represents an exchange rate for a currency.
 * @property {string} code - The currency code (e.g. "USD").
 * @property {string} name - The full name of the currency.
 * @property {number} rate - The exchange rate for the currency.
 */
export type RateObj = {
  code: string;
  name: string;
  rate: number;
};

/**
 * The response from the exchange rates API.
 * An array of exchange rates.
 */
export type RateResponse = RateObj[];

const defaultOptions: RequestOptions = {
  host: 'bitpay.com',
  path: '/rates',
  headers: {},
  agent: false,
};

const returnPromise = (options: RequestOptions): Promise<RateResponse> => {
  return new Promise((resolve, reject) => {
    https
      .get(options, (res) => {
        let dataBuffer = '';

        res.on('data', (chunk: Buffer) => {
          dataBuffer += chunk.toString('utf8');
        });

        res.on('end', () => {
          try {
            const { data } = JSON.parse(dataBuffer) as { data: RateObj[] };
            return resolve(data);
          } catch (err) {
            return reject(err as Error);
          }
        });
      })
      .on('error', (err) => {
        return reject(err as Error);
      });
  });
};

export const get = (code?: string): Promise<RateObj[]> => {
  if (typeof code === 'string') {
    defaultOptions.path += `/${code.toUpperCase()}`;
  }
  return returnPromise(defaultOptions);
};

export default { get };
