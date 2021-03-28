import nock from 'nock';

import { get } from './index';

describe('Get all rates', () => {
  beforeEach(() => {
    nock.cleanAll();
    nock('https://bitpay.com').get('/rates').reply(200, {
      data: [],
    });
  });

  test('using promises', async () => {
    const rates = await get();
    expect(typeof rates).toEqual('object');
    expect(Array.isArray(rates)).toBe(true);
  });

  test('using callback', () => {
    get((_, rates) => {
      expect(typeof rates).toEqual('object');
      expect(Array.isArray(rates)).toBe(true);
    });
  });
});

describe('Get a rate by code', () => {
  const code = 'ARS';

  beforeEach(() => {
    nock.cleanAll();
    nock('https://bitpay.com')
      .get(`/rates/${code}`)
      .reply(200, {
        data: {
          code,
          name: 'Argentine Peso',
          rate: 5237449.75,
        },
      });
  });

  test('using promises', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rate: any = await get(code);
    expect(typeof rate).toEqual('object');
    expect(rate.code).toEqual(code);
    expect(rate.name).toEqual('Argentine Peso');
  });

  test('using callback', () => {
    get(code, (_, rate) => {
      expect(typeof rate).toEqual('object');
      expect(rate.code).toEqual(code);
      expect(rate.name).toEqual('Argentine Peso');
    });
  });
});
