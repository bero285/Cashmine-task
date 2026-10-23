import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';

type InitialLoadStateProps = {
  // Shown when the first load failed, e.g. "Couldn't load balances".
  errorTitle: string;
  loadingLabel: string;
  error: unknown;
  isFetching: boolean;
  failureCount: number;
  onRetry: () => void;
};

// What a screen shows before its first data arrives: loading (with a hint while TanStack
// retries in the background), or the error with a retry button once retries are exhausted.
export function InitialLoadState({
  errorTitle,
  loadingLabel,
  error,
  isFetching,
  failureCount,
  onRetry,
}: InitialLoadStateProps) {
  if (error) {
    return <ErrorState title={errorTitle} error={error} onRetry={onRetry} retrying={isFetching} />;
  }
  return <LoadingState label={failureCount > 0 ? 'Still trying…' : loadingLabel} />;
}
