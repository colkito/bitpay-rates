import nock from 'nock';

import { get, RateObj } from './index';

describe('Get all rates', () => {
  beforeEach(() => {
    nock.cleanAll();
    nock('https://bitpay.com').get('/rates').reply(200, {
      data: [],
    });
  });

  test('using promises', async () => {
    const rates = await get();
    expect(typeof rates).toBe('object');
    expect(Array.isArray(rates)).toBe(true);
  });

  test('using callback', () => {
    get((_, rates) => {
      expect(typeof rates).toBe('object');
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
    const rate = (await get(code)) as RateObj;
    expect(typeof rate).toBe('object');
    expect(rate.code).toBe(code);
    expect(rate.name).toBe('Argentine Peso');
  });

  test('using callback', () => {
    get(code, (err, rate) => {
      const rateObj = rate as RateObj;
      expect(err).toBe(null);
      expect(typeof rateObj).toBe('object');
      expect(rateObj.code).toBe(code);
      expect(rateObj.name).toBe('Argentine Peso');
    });
  });
});
