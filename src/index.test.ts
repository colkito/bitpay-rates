import { get } from './index';

// Update tests for the `get` function:
// - Remove tests for callback usage
// - Add tests for promise usage with and without currency code
// - Verify currency code is properly handled

describe('get', () => {
  it('should return exchange rate data', async () => {
    const data = await get();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('code');
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('rate');
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
