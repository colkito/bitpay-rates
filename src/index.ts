export type RateObj = { code: string; name: string; rate: number };
export type RateResponse = RateObj | RateObj[];

const BITPAY_RATES = 'https://bitpay.com/rates';
const DEFAULT_BASE = 'BTC';
const REQUEST_TIMEOUT_MS = 10_000;
const REQUEST_HEADERS = {
  'X-Accept-Version': '2.0.0',
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

/**
 * Fetch BitPay exchange rates.
 *
 * @param quote - Optional quote currency (e.g. `'USD'`). See CODES.md.
 * @param base - Optional base cryptocurrency (default `'BTC'`).
 * @returns All rates for `base` when `quote` is omitted, otherwise a single {@link RateObj}.
 */
export function get(): Promise<RateObj[]>;
export function get(quote: string): Promise<RateObj>;
export function get(quote: string, base: string): Promise<RateObj>;
export async function get(quote?: string, base = DEFAULT_BASE): Promise<RateResponse> {
  const baseCode = base.toUpperCase();
  const url = quote
    ? `${BITPAY_RATES}/${baseCode}/${quote.toUpperCase()}`
    : `${BITPAY_RATES}/${baseCode}`;

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      const err = new Error(`Request to ${url} timed out after ${REQUEST_TIMEOUT_MS}ms`);
      controller.abort(err);
      reject(err);
    }, REQUEST_TIMEOUT_MS);
  });

  try {
    return await Promise.race([readRates(url, controller.signal), timeout]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

async function readRates(url: string, signal: AbortSignal): Promise<RateResponse> {
  const res = await fetch(url, { headers: REQUEST_HEADERS, signal });
  const text = await res.text();

  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch (err) {
    if (!res.ok) {
      throw new Error(`Request to ${url} failed with HTTP ${res.status}`);
    }
    throw err;
  }

  if (isRecord(json) && json.error != null) {
    throw new Error(String(json.error));
  }

  if (!res.ok) {
    throw new Error(`Request to ${url} failed with HTTP ${res.status}`);
  }

  if (!isRecord(json) || json.data == null) {
    throw new Error(`Unexpected response from ${url}`);
  }

  return json.data as RateResponse;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export default get;
