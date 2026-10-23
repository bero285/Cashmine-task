import { claimAmountMessage } from '@/utils/claim-messages';

const rules = { asset: 'ETH', decimals: 6, minAmount: '0.01', fee: '0.0012', available: '1.5' };

describe('claimAmountMessage', () => {
  it.each([
    ['empty', 'Enter an amount.'],
    ['format', 'Use digits with a dot, like 0.5.'],
    ['decimals', 'ETH allows at most 6 decimal places.'],
    ['belowMin', 'The minimum claim is 0.01 ETH.'],
    ['aboveAvailable', 'You have 1.5 ETH available.'],
    ['notAboveFee', 'The amount must be more than the 0.0012 ETH fee.'],
  ] as const)('explains %s', (error, text) => {
    expect(claimAmountMessage(error, rules)).toBe(text);
  });
});
