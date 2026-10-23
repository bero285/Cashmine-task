// "12 s ago" style age of a server timestamp. Null when the timestamp can't be parsed.
export function formatAge(iso: string, nowMs: number): string | null {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return null;

  // Clamped at 0: the phone's clock may run behind the server's.
  const seconds = Math.max(0, Math.floor((nowMs - then) / 1_000));
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds} s ago`;
  if (seconds < 3_600) return `${Math.floor(seconds / 60)} min ago`;
  return `${Math.floor(seconds / 3_600)} h ago`;
}
