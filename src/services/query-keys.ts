// Keys are not scoped by token: the whole cache is cleared when the token changes.
export const queryKeys = {
  balances: ['balances'] as const,
  activity: ['activity'] as const,
  claimOptions: (asset: string) => ['claim-options', asset] as const,
  claim: (id: string) => ['claim', id] as const,
};
