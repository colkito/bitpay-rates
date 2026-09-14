export type RateObj = { code: string; name: string; rate: number };
export type RateResponse = RateObj | RateObj[];

/** Arguments for {@link get}. Named so neither code can be passed in the wrong position. */
export type RateQuery = {
  /**
   * Base cryptocurrency: the asset being priced.
   *
   * @defaultValue `'BTC'`
   */
  base?: string;
  /**
   * Quote currency: what to price `base` in. Omit for every rate against
   * `base`.
   */
  quote?: string;
};

const BITPAY_RATES = 'https://bitpay.com/rates';
const DEFAULT_BASE = 'BTC';
const REQUEST_TIMEOUT_MS = 10_000;
const CODE_PATTERN = /^[A-Z0-9]{2,10}$/;
const REQUEST_HEADERS = {
  'X-Accept-Version': '2.0.0',
  Accept: 'application/json',
  'User-Agent': 'bitpay-rates',
};

/**
 * Fetch BitPay exchange rates.
 *
 * @param query - `{ base, quote }`. Omit `quote` for the full table, omit both for BTC.
 * @returns Every rate for `base` when `quote` is omitted, otherwise that single {@link RateObj}.
 * @throws `TypeError` if a code is not 2-10 alphanumeric characters, before any request is made.
 *
 * @example
 * await get();                              // every rate against BTC
 * await get({ base: 'ETH' });               // every rate against ETH
 * await get({ quote: 'USD' });              // BTC/USD
 * await get({ base: 'ETH', quote: 'USD' }); // ETH/USD
 */
export function get(): Promise<RateObj[]>;
export function get(query: { base?: string; quote?: undefined }): Promise<RateObj[]>;
export function get(query: { base?: string; quote: string }): Promise<RateObj>;
export async function get(query: RateQuery = {}): Promise<RateResponse> {
  const { quote } = query;
  const base = normalizeCode(query.base ?? DEFAULT_BASE, 'base');
  const wantsTable = quote === undefined;
  const url = wantsTable
    ? `${BITPAY_RATES}/${base}`
    : `${BITPAY_RATES}/${base}/${normalizeCode(quote, 'quote')}`;

  try {
    return await readRates(url, AbortSignal.timeout(REQUEST_TIMEOUT_MS), wantsTable);
  } catch (err) {
    if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
      throw new Error(`Request to ${url} timed out after ${REQUEST_TIMEOUT_MS}ms`);
    }
    throw err;
  }
}

/**
 * Uppercase a currency code and reject anything that is not a plain code, so
 * caller input can never steer the request to another path on bitpay.com.
 */
function normalizeCode(value: string, label: 'base' | 'quote'): string {
  const code = value.toUpperCase();
  if (!CODE_PATTERN.test(code)) {
    throw new TypeError(`Invalid ${label} currency code: ${JSON.stringify(value)}`);
  }
  return code;
}

async function readRates(
  url: string,
  signal: AbortSignal,
  wantsTable: boolean,
): Promise<RateResponse> {
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

  const data = isRecord(json) ? json.data : undefined;

  // `/rates/{code}` is polymorphic: a base with a rate table answers with a
  // list, anything else answers with a single rate. Check the shape so the
  // declared return type cannot lie.
  if (wantsTable) {
    if (!Array.isArray(data) || !data.every(isRateObj)) {
      throw new Error(`Unexpected response from ${url}: expected a list of rates`);
    }
  } else if (!isRateObj(data)) {
    throw new Error(`Unexpected response from ${url}: expected a single rate`);
  }

  return data as RateResponse;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Every field is checked, so the declared type is not a promise the runtime
 * breaks. All 388 rows the live API returns for BTC and ETH satisfy this.
 */
function isRateObj(value: unknown): value is RateObj {
  return (
    isRecord(value) &&
    typeof value.code === 'string' &&
    typeof value.name === 'string' &&
    typeof value.rate === 'number'
  );
}

/**
 * Namespace object, so `import bitpayRates` / `require(...)` + `.get()` works
 * the same as the named export.
 */
export default { get };
