// Approach C for "what does the balance show right after a claim":
// 1. Never replace a snapshot with an older one, so numbers only move forward.
// 2. After a claim, keep the current numbers marked "Updating…" and poll faster until a snapshot
//    taken at or after the claim's createdAt arrives (the docs say a new claim may only appear in
//    the next snapshot). Both times come from the server clock, so phone clock drift doesn't matter.

export const CLAIM_SYNC_POLL_MS = 3_000;
// Snapshots are rebuilt every 15 s; a minute without one means something else is wrong, so stop
// fast polling and fall back to the normal 15 s refresh.
export const CLAIM_SYNC_TIMEOUT_MS = 60_000;

export type ClaimSync = {
  // Server createdAt of the latest claim made on this device.
  since: string;
  // Client time when we started waiting; only used for the timeout.
  startedAtMs: number;
};

export function pickLatestSnapshot<T extends { asOf: string }>(prev: T | undefined, next: T): T {
  if (!prev) return next;
  const prevTime = Date.parse(prev.asOf);
  const nextTime = Date.parse(next.asOf);
  // Can't compare: trust the server's latest answer rather than freezing on old data.
  if (Number.isNaN(prevTime) || Number.isNaN(nextTime)) return next;
  return nextTime >= prevTime ? next : prev;
}

export function isAwaitingClaim(
  asOf: string | undefined,
  sync: ClaimSync | null,
  nowMs: number,
): boolean {
  if (!sync) return false;
  if (nowMs - sync.startedAtMs >= CLAIM_SYNC_TIMEOUT_MS) return false;
  if (asOf === undefined) return true;
  const snapshotTime = Date.parse(asOf);
  const claimTime = Date.parse(sync.since);
  if (Number.isNaN(snapshotTime) || Number.isNaN(claimTime)) return false;
  return snapshotTime < claimTime;
}
