import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';

import bitpayRates, { get } from './index.mts';

type FetchHandler = (url: string, init?: RequestInit) => Response | Promise<Response>;

const RATES = [{ code: 'USD', name: 'US Dollar', rate: 1 }];
const RATE = { code: 'USD', name: 'US Dollar', rate: 42 };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function stubFetch(handler: FetchHandler): { url: string; init?: RequestInit }[] {
  const calls: { url: string; init?: RequestInit }[] = [];
  mock.method(
    globalThis,
    'fetch',
    async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
      const url = String(input);
      calls.push({ url, init });
      if (init?.signal?.aborted) {
        throw init.signal.reason ?? new DOMException('Aborted', 'AbortError');
      }
      return handler(url, init);
    },
  );
  return calls;
}

function header(init: RequestInit | undefined, name: string): string | null {
  return new Headers(init?.headers).get(name);
}

describe('get', { concurrency: false }, () => {
  afterEach(() => mock.reset());

  it('returns every BTC rate from /rates/BTC', async () => {
    const calls = stubFetch(() => jsonResponse({ data: RATES }));

    const data = await get();

    assert.equal(calls[0]?.url, 'https://bitpay.com/rates/BTC');
    assert.deepEqual(data, RATES);
  });

  it('returns every rate for another base from /rates/{base}', async () => {
    const calls = stubFetch(() => jsonResponse({ data: RATES }));

    const data = await get({ base: 'eth' });

    assert.equal(calls[0]?.url, 'https://bitpay.com/rates/ETH');
    assert.deepEqual(data, RATES);
  });

  it('returns a single BTC/quote rate and uppercases the quote', async () => {
    const calls = stubFetch(() => jsonResponse({ data: RATE }));

    const data = await get({ quote: 'usd' });

    assert.equal(calls[0]?.url, 'https://bitpay.com/rates/BTC/USD');
    assert.equal(Array.isArray(data), false);
    assert.deepEqual(data, RATE);
  });

  it('returns a pair when base and quote are both given', async () => {
    const calls = stubFetch(() => jsonResponse({ data: RATE }));

    const data = await get({ base: 'eth', quote: 'usd' });

    assert.equal(calls[0]?.url, 'https://bitpay.com/rates/ETH/USD');
    assert.deepEqual(data, RATE);
  });

  it('treats a crypto quote as base/quote, not as a base', async () => {
    const calls = stubFetch(() => jsonResponse({ data: RATE }));

    await get({ quote: 'ETH' });

    assert.equal(calls[0]?.url, 'https://bitpay.com/rates/BTC/ETH');
  });

  it('sends the BitPay v2 version, accept and user-agent headers', async () => {
    const calls = stubFetch(() => jsonResponse({ data: [] }));

    await get();

    assert.equal(header(calls[0]?.init, 'X-Accept-Version'), '2.0.0');
    assert.equal(header(calls[0]?.init, 'Accept'), 'application/json');
    assert.equal(header(calls[0]?.init, 'User-Agent'), 'bitpay-rates');
  });

  it('rejects codes that are not plain currency codes, before any request', async () => {
    const calls = stubFetch(() => jsonResponse({ data: [] }));

    for (const bad of ['../../api/rates', 'USD?foo=bar', 'a/b', '', 'TOOLONGACODE']) {
      await assert.rejects(
        get({ quote: bad }),
        TypeError,
        `expected quote ${JSON.stringify(bad)} to be rejected`,
      );
      await assert.rejects(
        get({ base: bad }),
        TypeError,
        `expected base ${JSON.stringify(bad)} to be rejected`,
      );
    }

    assert.equal(calls.length, 0, 'no request should leave the process');
  });

  it('rejects when a single rate was asked for but a list came back', async () => {
    stubFetch(() => jsonResponse({ data: RATES }));

    await assert.rejects(get({ quote: 'USD' }), /expected a single rate/);
  });

  it('rejects when the full table was asked for but a single rate came back', async () => {
    // BitPay answers /rates/USD with BTC/USD rather than a table.
    stubFetch(() => jsonResponse({ data: RATE }));

    await assert.rejects(get({ base: 'USD' }), /expected a list of rates/);
  });

  it('rejects a rate that is missing a field or has the wrong type', async () => {
    const broken = [
      { code: 'USD', name: 'US Dollar' },
      { code: 'USD', name: 'US Dollar', rate: '42' },
      { code: 'USD', rate: 42 },
      { name: 'US Dollar', rate: 42 },
      { code: 42, name: 'US Dollar', rate: 42 },
    ];

    for (const data of broken) {
      stubFetch(() => jsonResponse({ data }));
      await assert.rejects(
        get({ quote: 'USD' }),
        /expected a single rate/,
        `expected ${JSON.stringify(data)} to be rejected`,
      );
      mock.reset();
    }
  });

  it('rejects a table containing one broken row', async () => {
    stubFetch(() => jsonResponse({ data: [RATE, { code: 'EUR', name: 'Euro' }] }));

    await assert.rejects(get(), /expected a list of rates/);
  });

  it('rejects when data is present but not an object', async () => {
    for (const data of [0, '', false, 'text', 42]) {
      stubFetch(() => jsonResponse({ data }));
      await assert.rejects(get(), /expected a list of rates/);
      mock.reset();
    }
  });

  it('rejects when the API returns an error field', async () => {
    stubFetch(() => jsonResponse({ error: '"INVALID" is not a valid currency.' }));

    await assert.rejects(get({ quote: 'INVALID' }), /"INVALID" is not a valid currency/);
  });

  it('rejects on HTTP 404', async () => {
    stubFetch(() => new Response('Not Found', { status: 404 }));

    await assert.rejects(get({ quote: 'NOPE' }), /HTTP 404/);
  });

  it('rejects on HTTP 429', async () => {
    stubFetch(() => new Response('error code: 1015', { status: 429 }));

    await assert.rejects(get(), /HTTP 429/);
  });

  it('rejects on malformed JSON', async () => {
    stubFetch(
      () =>
        new Response('not json', { status: 200, headers: { 'content-type': 'application/json' } }),
    );

    await assert.rejects(get(), SyntaxError);
  });

  it('rejects when the payload has no data field', async () => {
    stubFetch(() => jsonResponse({ foo: 1 }));

    await assert.rejects(get(), /expected a list of rates/);
  });

  it('rejects on a network error', async () => {
    stubFetch(() => Promise.reject(new Error('ECONNREFUSED')));

    await assert.rejects(get(), /ECONNREFUSED/);
  });

  it('rejects when the request times out', async () => {
    mock.method(AbortSignal, 'timeout', () =>
      AbortSignal.abort(new DOMException('The operation timed out', 'TimeoutError')),
    );
    stubFetch(() => new Promise(() => {}));

    await assert.rejects(get(), /timed out after 10000ms/);
  });
});

describe('exports', () => {
  it('exposes get on the default export without making it callable', () => {
    // Guards the shape smoke-tested against dist/: reverting to
    // `export default get` would silently break `bitpayRates.get()`.
    assert.equal(typeof bitpayRates.get, 'function');
    assert.equal(typeof bitpayRates, 'object');
    assert.equal(bitpayRates.get, get);
  });
});
