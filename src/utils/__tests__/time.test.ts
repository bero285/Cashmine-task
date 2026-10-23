import { formatAge } from '@/utils/time';

const asOf = '2026-10-20T08:00:00.000Z';
const at = (seconds: number) => Date.parse(asOf) + seconds * 1_000;

describe('formatAge', () => {
  it.each([
    [0, 'just now'],
    [4, 'just now'],
    [12, '12 s ago'],
    [59, '59 s ago'],
    [60, '1 min ago'],
    [3_599, '59 min ago'],
    [3_600, '1 h ago'],
    [7_300, '2 h ago'],
  ])('formats %i s as %p', (seconds, text) => {
    expect(formatAge(asOf, at(seconds))).toBe(text);
  });

  it('treats a snapshot from the future (clock skew) as just now', () => {
    expect(formatAge(asOf, at(-30))).toBe('just now');
  });

  it('returns null for an unparseable time', () => {
    expect(formatAge('not a date', at(0))).toBeNull();
  });
});
