// API payloads as documented at https://task-api.cashmine.io/docs.
// Amounts are decimal strings in the asset's unit; times are ISO 8601 UTC strings.

export type Balance = {
  asset: string;
  decimals: number;
  available: string;
  pending: string;
  claiming: string;
  usdPrice: string;
};

export type BalancesResponse = {
  asOf: string;
  items: Balance[];
};

export type ActivityType = 'accrual' | 'reversal' | 'claim';
export type ActivityStatus = 'pending' | 'confirmed' | 'completed' | 'failed';

export type ActivityItem = {
  id: string;
  type: ActivityType;
  asset: string;
  // Signed: negative for reversals and claims.
  amount: string;
  status: ActivityStatus;
  exchange: string | null;
  createdAt: string;
  relatedId: string | null;
};

export type ActivityPage = {
  items: ActivityItem[];
  nextCursor: string | null;
};

export type Destination = {
  id: string;
  label: string;
};

export type ClaimOptions = {
  asset: string;
  minAmount: string;
  fee: string;
  destinations: Destination[];
};

export type ClaimStatus = 'pending' | 'completed' | 'failed';

export type Claim = {
  id: string;
  asset: string;
  amount: string;
  fee: string;
  receiveAmount: string;
  destinationId: string;
  status: ClaimStatus;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateClaimBody = {
  asset: string;
  amount: string;
  destinationId: string;
};

export type ApiErrorCode =
  | 'VALIDATION'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'IDEMPOTENCY_MISMATCH'
  | 'RATE_LIMITED'
  | 'SERVER'
  | 'TIMEOUT';

export type ApiErrorBody = {
  code: ApiErrorCode;
  message: string;
  field?: string;
  retryAfterMs?: number;
};
