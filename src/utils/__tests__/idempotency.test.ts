import { newIdempotencyKey } from '@/utils/idempotency';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('newIdempotencyKey', () => {
  it('uses crypto.randomUUID when available', () => {
    const cryptoImpl = {
      randomUUID: () => '11111111-2222-4333-8444-555555555555',
      getRandomValues: (array: Uint8Array<ArrayBuffer>) => array,
    };
    expect(newIdempotencyKey(cryptoImpl)).toBe('11111111-2222-4333-8444-555555555555');
  });

  it('builds a v4 UUID from getRandomValues when randomUUID is missing (plain-http LAN testing)', () => {
    const cryptoImpl = {
      getRandomValues: (array: Uint8Array<ArrayBuffer>) => array.fill(0xff),
    };
    const key = newIdempotencyKey(cryptoImpl);
    expect(key).toMatch(UUID_V4);
    expect(key).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff');
  });

  it('gives different keys on each call', () => {
    expect(newIdempotencyKey()).not.toBe(newIdempotencyKey());
  });

  it('stays within the API limit of 100 characters', () => {
    expect(newIdempotencyKey().length).toBeLessThanOrEqual(100);
  });
});
