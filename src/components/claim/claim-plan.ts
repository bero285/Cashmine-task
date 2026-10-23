import type { CreateClaimBody, Destination } from '@/services/types';

// A validated claim ready for review. All amounts are canonical strings in the asset's unit.
export type ClaimPlan = {
  asset: string;
  decimals: number;
  amount: string;
  fee: string;
  receive: string;
  destination: Destination;
};

export function toClaimBody(plan: ClaimPlan): CreateClaimBody {
  return { asset: plan.asset, amount: plan.amount, destinationId: plan.destination.id };
}
