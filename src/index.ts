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

import fs from 'fs';
import path from 'path';

// Export the getRate function as the default export
export default get;

/**
 * Updates the CODES.md file with the latest currency codes, names, and rates from the provided JSON response.
 * @param {string} jsonResponse - The JSON response string containing the currency data.
 */
export const updateCodes = (jsonResponse: string): void => {
  // Parse the JSON response into a JavaScript object
  const { data } = JSON.parse(jsonResponse);

  // Extract the currency code, name, and rate from each object in the data array
  const currencyEntries = data.map((currency: { code: string; name: string; rate: number }) => {
    const { code, name } = currency;
    return `- ${code} (${name})`;
  });

  // Sort the currency entries alphabetically by currency code
  const sortedEntries = currencyEntries.sort();

  // Get today's date and format it as "YYYY-MM-DD"
  const today = new Date().toISOString().slice(0, 10);

  // Read the contents of the CODES.md file
  const codesFilePath = path.join(__dirname, '..', 'CODES.md');
  const codesContent = fs.readFileSync(codesFilePath, 'utf8');

  // Replace the existing currency list with the sorted entries and update the "updated" date
  const updatedContent = codesContent.replace(
    /## Available Codes[\s\S]*?(?=##)/,
    `## Available Codes\n\nThis is the complete list of ${sortedEntries.length} codes:\n\n${sortedEntries.join('\n')}\n`
  ).replace(
    /updated: \d{4}-\d{2}-\d{2}/,
    `updated: ${today}`
  );

  // Write the updated contents back to the CODES.md file
  fs.writeFileSync(codesFilePath, updatedContent, 'utf8');
};
