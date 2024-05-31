/**
 * Import the necessary types and modules.
 * Using `import type` ensures better runtime safety.
 */
import https from 'https';
import { type IncomingMessage, type RequestOptions } from 'http';

/**
 * Represents an exchange rate for a currency.
 * @property {string} code - The currency code (e.g., "USD").
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
 * Can be a single exchange rate or an array of exchange rates.
 */
export type RateResponse = RateObj | RateObj[];

/**
 * API-related constants and options for performance and security.
 */
const API_HOST = 'bitpay.com';
const API_PATH = '/rates';
const USER_AGENT = 'bitpay-rates/1.2.18';

const defaultReqOptions: RequestOptions = {
  host: API_HOST,
  path: API_PATH,
  headers: {
    'User-Agent': USER_AGENT, // Set a user-agent for security and identification
  },
  agent: new https.Agent({ keepAlive: true }), // Use a keep-alive agent for better performance
};

/**
 * Retrieves the exchange rate for a given currency code or all available
 * exchange rates if no currency code is provided.
 * @param {string} [code] - The currency code (e.g., "USD") to retrieve the exchange rate for.
 * @returns {Promise<RateResponse>} A Promise that resolves with the API response data.
 */
export const get = (code?: string): Promise<RateResponse> => {
  const reqOptions = {
    ...defaultReqOptions,
    path: `${API_PATH}${code ? `/${code.toUpperCase()}` : ''}`,
  };

  /**
   * Sends an HTTPS request to the exchange rates API and returns a Promise
   * with the response data.
   * @param {RequestOptions} options - The request options for the API call.
   * @returns {Promise<RateResponse>} A Promise that resolves with the API response data.
   */
  return new Promise((resolve, reject) => {
    const req = https.request(reqOptions, (res: IncomingMessage) => {
      let dataBuffer = '';

      // Handle the response data
      res.on('data', (chunk: Buffer) => {
        dataBuffer += chunk.toString('utf8');
      });

      // Handle the response end
      res.on('end', () => {
        try {
          const { data, error } = JSON.parse(dataBuffer);
          if (error) {
            throw new Error(error);
          }
          resolve(data);
        } catch (err) {
          reject(err);
        }
      });
    });

    // Handle request errors
    req.on('error', (err: Error) => {
      reject(new Error(`Error sending API request: ${err.message}`));
    });

    // End the request
    req.end();
  });
};

// Export the getRate function as the default export
export default get;
