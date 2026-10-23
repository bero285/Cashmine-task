import { CLAIM_SYNC_TIMEOUT_MS, isAwaitingClaim, pickLatestSnapshot } from '@/utils/balance-sync';

const t = (iso: string) => ({ asOf: iso });

describe('pickLatestSnapshot', () => {
  it('takes the incoming snapshot when there is none yet', () => {
    const next = t('2026-10-20T08:00:15.000Z');
    expect(pickLatestSnapshot(undefined, next)).toBe(next);
  });

  it('takes a newer snapshot', () => {
    const next = t('2026-10-20T08:00:30.000Z');
    expect(pickLatestSnapshot(t('2026-10-20T08:00:15.000Z'), next)).toBe(next);
  });

  it('takes the same snapshot time (a re-read of the current snapshot)', () => {
    const next = t('2026-10-20T08:00:15.000Z');
    expect(pickLatestSnapshot(t('2026-10-20T08:00:15.000Z'), next)).toBe(next);
  });

  it('keeps the current snapshot when the incoming one is older', () => {
    const prev = t('2026-10-20T08:00:30.000Z');
    expect(pickLatestSnapshot(prev, t('2026-10-20T08:00:15.000Z'))).toBe(prev);
  });

  it('takes the incoming snapshot if either time is unparseable', () => {
    const next = t('2026-10-20T08:00:15.000Z');
    expect(pickLatestSnapshot(t('garbage'), next)).toBe(next);
  });
});

describe('isAwaitingClaim', () => {
  const since = '2026-10-20T08:00:20.000Z';
  const startedAtMs = 1_000_000;
  const sync = { since, startedAtMs };

  it('is false when no claim was made', () => {
    expect(isAwaitingClaim('2026-10-20T08:00:15.000Z', null, startedAtMs)).toBe(false);
  });

  it('is true while the snapshot is older than the claim', () => {
    expect(isAwaitingClaim('2026-10-20T08:00:15.000Z', sync, startedAtMs + 5_000)).toBe(true);
  });

  it('is true while there is no snapshot yet', () => {
    expect(isAwaitingClaim(undefined, sync, startedAtMs)).toBe(true);
  });

  it('is false once a snapshot at or after the claim arrives', () => {
    expect(isAwaitingClaim('2026-10-20T08:00:20.000Z', sync, startedAtMs + 5_000)).toBe(false);
    expect(isAwaitingClaim('2026-10-20T08:00:30.000Z', sync, startedAtMs + 5_000)).toBe(false);
  });

  it('gives up after the timeout so polling never runs forever', () => {
    const now = startedAtMs + CLAIM_SYNC_TIMEOUT_MS;
    expect(isAwaitingClaim('2026-10-20T08:00:15.000Z', sync, now)).toBe(false);
  });

  it('is false if a time cannot be parsed', () => {
    expect(isAwaitingClaim('garbage', sync, startedAtMs)).toBe(false);
  });
});
