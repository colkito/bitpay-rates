import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import https from 'node:https';
import { afterEach, describe, it, mock } from 'node:test';

import { get } from './index';

/** Minimal stand-in for the ClientRequest returned by https.get. */
class FakeRequest extends EventEmitter {
  setTimeout = mock.fn();
  destroy = mock.fn();
}

/**
 * Stub https.get so it replays the given body to the response callback,
 * without ever touching the network.
 */
function stubHttpsGet(body: string): { req: FakeRequest; capturedUrl: string } {
  const req = new FakeRequest();
  let capturedUrl = '';

  mock.method(https, 'get', (url: string, cb: (res: EventEmitter) => void) => {
    capturedUrl = url;
    const res = new EventEmitter();
    cb(res);
    // Emit asynchronously to mirror real socket behaviour.
    setImmediate(() => {
      res.emit('data', Buffer.from(body));
      res.emit('end');
    });
    return req as unknown as ReturnType<typeof https.get>;
  });

  // `capturedUrl` is filled in when get() invokes the stub.
  return {
    req,
    get capturedUrl() {
      return capturedUrl;
    },
  } as { req: FakeRequest; capturedUrl: string };
}

describe('get', () => {
  afterEach(() => mock.restoreAll());

  it('returns all exchange rates as an array', async () => {
    const payload = { data: [{ code: 'ARS', name: 'Argentine Peso', rate: 1 }] };
    const stub = stubHttpsGet(JSON.stringify(payload));

    const data = await get();

    assert.equal(stub.capturedUrl, 'https://bitpay.com/api/rates');
    assert.ok(Array.isArray(data));
    assert.deepEqual(data, payload.data);
  });

  it('returns a single rate for a specific currency and uppercases the code', async () => {
    const payload = { data: { code: 'USD', name: 'US Dollar', rate: 42 } };
    const stub = stubHttpsGet(JSON.stringify(payload));

    const data = await get('usd');

    assert.equal(stub.capturedUrl, 'https://bitpay.com/api/rates/USD');
    assert.equal(Array.isArray(data), false);
    assert.deepEqual(data, payload.data);
  });

  it('rejects when the API returns an error field', async () => {
    stubHttpsGet(JSON.stringify({ error: 'Currency code must be a type string' }));

    await assert.rejects(get('INVALID'), /Currency code must be a type string/);
  });

  it('rejects on malformed JSON', async () => {
    stubHttpsGet('not json');

    await assert.rejects(get(), SyntaxError);
  });

  it('rejects on a network error', async () => {
    const req = new FakeRequest();
    mock.method(https, 'get', (_url: string, _cb: unknown) => {
      setImmediate(() => req.emit('error', new Error('ECONNREFUSED')));
      return req as unknown as ReturnType<typeof https.get>;
    });

    await assert.rejects(get(), /ECONNREFUSED/);
  });
});
