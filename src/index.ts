import type { IncomingMessage } from 'node:http';
import https from 'node:https';

export type RateObj = { code: string; name: string; rate: number };
export type RateResponse = RateObj | RateObj[];

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Fetch BitPay exchange rates.
 *
 * @param code - Optional ISO currency code (e.g. `'USD'`). See CODES.md.
 * @returns A single {@link RateObj} when `code` is provided, otherwise an array of all rates.
 */
export function get(code?: string): Promise<RateResponse> {
  const url = `https://bitpay.com/api/rates${code ? `/${code.toUpperCase()}` : ''}`;

  return new Promise<RateResponse>((resolve, reject) => {
    const req = https.get(url, (res: IncomingMessage) => {
      let body = '';
      res.on('data', (chunk: Buffer) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.error) reject(new Error(json.error));
          else resolve(json.data ?? json);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error(`Request to ${url} timed out after ${REQUEST_TIMEOUT_MS}ms`));
    });
  });
}

export default get;
