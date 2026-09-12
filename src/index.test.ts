import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';

import { get } from './index';

type FetchHandler = (url: string, init?: RequestInit) => Response | Promise<Response>;

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
      return handler(url, init);
    },
  );
  return calls;
}

function header(init: RequestInit | undefined, name: string): string | null {
  return new Headers(init?.headers).get(name);
}

describe('get', { concurrency: false }, () => {
  afterEach(() => mock.restoreAll());

  it('returns all BTC rates from /rates/BTC', async () => {
    const rates = [{ code: 'USD', name: 'US Dollar', rate: 1 }];
    const calls = stubFetch(() => jsonResponse({ data: rates }));

    const data = await get();

    assert.equal(calls[0]?.url, 'https://bitpay.com/rates/BTC');
    assert.deepEqual(data, rates);
  });

  it('returns a single BTC/quote rate and uppercases the quote', async () => {
    const rate = { code: 'USD', name: 'US Dollar', rate: 42 };
    const calls = stubFetch(() => jsonResponse({ data: rate }));

    const data = await get('usd');

    assert.equal(calls[0]?.url, 'https://bitpay.com/rates/BTC/USD');
    assert.equal(Array.isArray(data), false);
    assert.deepEqual(data, rate);
  });

  it('returns a pair when quote and base are provided', async () => {
    const rate = { code: 'USD', name: 'US Dollar', rate: 2488.43 };
    const calls = stubFetch(() => jsonResponse({ data: rate }));

    const data = await get('usd', 'eth');

    assert.equal(calls[0]?.url, 'https://bitpay.com/rates/ETH/USD');
    assert.deepEqual(data, rate);
  });

  it('treats a crypto quote as BTC/quote, not as a base currency', async () => {
    const rate = { code: 'ETH', name: 'Ether', rate: 0.032 };
    const calls = stubFetch(() => jsonResponse({ data: rate }));

    const data = await get('ETH');

    assert.equal(calls[0]?.url, 'https://bitpay.com/rates/BTC/ETH');
    assert.deepEqual(data, rate);
  });

  it('sends the BitPay v2 version and accept headers', async () => {
    const calls = stubFetch(() => jsonResponse({ data: [] }));

    await get();

    assert.equal(header(calls[0]?.init, 'X-Accept-Version'), '2.0.0');
    assert.equal(header(calls[0]?.init, 'Accept'), 'application/json');
    assert.equal(header(calls[0]?.init, 'Content-Type'), 'application/json');
  });

  it('rejects when the API returns an error field', async () => {
    stubFetch(() => jsonResponse({ error: '"INVALID" is not a valid currency.' }));

    await assert.rejects(get('INVALID'), /"INVALID" is not a valid currency/);
  });

  it('rejects on HTTP 404', async () => {
    stubFetch(() => new Response('Not Found', { status: 404 }));

    await assert.rejects(get('NOPE'), /HTTP 404/);
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

    await assert.rejects(get(), /Unexpected response/);
  });

  it('rejects on a network error', async () => {
    stubFetch(() => Promise.reject(new Error('ECONNREFUSED')));

    await assert.rejects(get(), /ECONNREFUSED/);
  });

  it('rejects when the request times out', async () => {
    mock.timers.enable({ apis: ['setTimeout'] });
    stubFetch(() => new Promise(() => {}));

    const pending = get();
    mock.timers.tick(10_000);

    await assert.rejects(pending, /timed out after 10000ms/);
  });
});
