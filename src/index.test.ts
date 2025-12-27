import { get } from './index';

describe('get', () => {
  // Promise tests
  describe('promises', () => {
    it('should return all exchange rates', async () => {
      const data = await get();
      expect(Array.isArray(data)).toBe(true);
      if (Array.isArray(data)) {
        expect(data[0]).toHaveProperty('code');
        expect(data[0]).toHaveProperty('name');
        expect(data[0]).toHaveProperty('rate');
      }
    });

    it('should return exchange rate for a specific currency', async () => {
      const data = await get('USD');
      expect(Array.isArray(data)).toBe(false);
      expect(data).toHaveProperty('code', 'USD');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('rate');
    });

    it('should handle invalid currency codes', async () => {
      await expect(get('INVALID')).rejects.toThrow();
    });
  });

  // Callback tests
  describe('callbacks', () => {
    it('should return all exchange rates via callback', (done) => {
      get((err, data) => {
        expect(err).toBeNull();
        expect(Array.isArray(data)).toBe(true);
        if (Array.isArray(data)) {
          expect(data[0]).toHaveProperty('code');
          expect(data[0]).toHaveProperty('name');
          expect(data[0]).toHaveProperty('rate');
        }
        done();
      });
    });

    it('should return exchange rate for a specific currency via callback', (done) => {
      get('USD', (err, data) => {
        expect(err).toBeNull();
        expect(Array.isArray(data)).toBe(false);
        expect(data).toHaveProperty('code', 'USD');
        expect(data).toHaveProperty('name');
        expect(data).toHaveProperty('rate');
        done();
      });
    });

    it('should handle invalid currency codes via callback', (done) => {
      get('INVALID', (err) => {
        expect(err).toBeInstanceOf(Error);
        done();
      });
    });
  });
});
