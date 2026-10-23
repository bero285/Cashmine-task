import { useEffect, useState } from 'react';

// Current time that re-renders the caller every `intervalMs`, for live "x s ago" labels.
export function useNow(intervalMs = 1_000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
