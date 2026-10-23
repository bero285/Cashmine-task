import { isSameClaimBody, parseClaimDraft, type ClaimDraft } from '@/utils/claim-draft';

const draft: ClaimDraft = {
  token: 'tok',
  idempotencyKey: 'key-1',
  body: { asset: 'ETH', amount: '0.5', destinationId: 'dest_wallet' },
  savedAtMs: 1_000,
};

describe('isSameClaimBody', () => {
  it('matches an identical body', () => {
    expect(isSameClaimBody(draft.body, { ...draft.body })).toBe(true);
  });

  it.each([
    ['asset', { ...draft.body, asset: 'BTC' }],
    ['amount', { ...draft.body, amount: '0.6' }],
    ['destination', { ...draft.body, destinationId: 'other' }],
  ])('does not match a different %s', (_field, other) => {
    expect(isSameClaimBody(draft.body, other)).toBe(false);
  });
});

describe('parseClaimDraft', () => {
  it('reads back a stored draft', () => {
    expect(parseClaimDraft(JSON.stringify(draft))).toEqual(draft);
  });

  it.each([null, '', 'not json', '{}', JSON.stringify({ ...draft, body: { asset: 'ETH' } })])(
    'returns null for %p',
    (stored) => {
      expect(parseClaimDraft(stored)).toBeNull();
    },
  );
});
