import { InvalidResponseError } from '@/services/api-error';
import {
  decodeActivityPage,
  decodeBalances,
  decodeClaim,
  decodeClaimOptions,
  decodeErrorBody,
} from '@/services/decoders';

const balances = {
  asOf: '2026-10-20T08:01:15.000Z',
  items: [
    {
      asset: 'USDT',
      decimals: 6,
      available: '820.413207',
      pending: '50.12',
      claiming: '0',
      usdPrice: '1.0002',
    },
  ],
};

const claim = {
  id: 'clm_1',
  asset: 'ETH',
  amount: '0.5',
  fee: '0.0012',
  receiveAmount: '0.4988',
  destinationId: 'dest_wallet',
  status: 'pending',
  failureReason: null,
  createdAt: '2026-10-20T08:01:15.000Z',
  updatedAt: '2026-10-20T08:01:15.000Z',
};

describe('decodeBalances', () => {
  it('accepts a documented payload', () => {
    expect(decodeBalances(balances)).toEqual(balances);
  });

  it('rejects an amount sent as a JSON number', () => {
    const bad = { ...balances, items: [{ ...balances.items[0], available: 820.41 }] };
    expect(() => decodeBalances(bad)).toThrow(InvalidResponseError);
  });

  it('rejects an amount with more decimals than the asset allows', () => {
    const bad = { ...balances, items: [{ ...balances.items[0], pending: '0.1234567' }] };
    expect(() => decodeBalances(bad)).toThrow(InvalidResponseError);
  });

  it('rejects a missing items array', () => {
    expect(() => decodeBalances({ asOf: balances.asOf })).toThrow(InvalidResponseError);
  });
});

describe('decodeClaim', () => {
  it('accepts a documented payload', () => {
    expect(decodeClaim(claim)).toEqual(claim);
  });

  it('rejects an unknown status', () => {
    expect(() => decodeClaim({ ...claim, status: 'done' })).toThrow(InvalidResponseError);
  });
});

describe('decodeClaimOptions', () => {
  it('accepts a documented payload', () => {
    const options = {
      asset: 'ETH',
      minAmount: '0.01',
      fee: '0.0012',
      destinations: [{ id: 'dest_wallet', label: 'Wallet 0x8f3e…a91c' }],
    };
    expect(decodeClaimOptions(options)).toEqual(options);
  });
});

describe('decodeActivityPage', () => {
  it('accepts signed amounts and null fields', () => {
    const page = {
      items: [
        {
          id: 'act_1',
          type: 'claim',
          asset: 'USDT',
          amount: '-9.81',
          status: 'completed',
          exchange: null,
          createdAt: '2026-10-20T08:01:15.000Z',
          relatedId: null,
        },
      ],
      nextCursor: null,
    };
    expect(decodeActivityPage(page)).toEqual(page);
  });
});

describe('decodeErrorBody', () => {
  it('reads the error envelope', () => {
    const body = { error: { code: 'VALIDATION', message: 'Too much', field: 'amount' } };
    expect(decodeErrorBody(body)).toEqual({
      code: 'VALIDATION',
      message: 'Too much',
      field: 'amount',
    });
  });

  it('reads retryAfterMs on 429', () => {
    const body = { error: { code: 'RATE_LIMITED', message: 'Slow down', retryAfterMs: 2300 } };
    expect(decodeErrorBody(body)?.retryAfterMs).toBe(2300);
  });

  it('returns null for anything else', () => {
    expect(decodeErrorBody('<html>Bad gateway</html>')).toBeNull();
    expect(decodeErrorBody({ error: { code: 'WHAT', message: 'x' } })).toBeNull();
  });
});
