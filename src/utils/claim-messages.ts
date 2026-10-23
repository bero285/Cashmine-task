import type { ClaimAmountError, ClaimRules } from '@/utils/claim-validation';

export function claimAmountMessage(
  error: ClaimAmountError,
  rules: ClaimRules & { asset: string },
): string {
  const { asset } = rules;
  switch (error) {
    case 'empty':
      return 'Enter an amount.';
    case 'format':
      return 'Use digits with a dot, like 0.5.';
    case 'decimals':
      return `${asset} allows at most ${rules.decimals} decimal places.`;
    case 'belowMin':
      return `The minimum claim is ${rules.minAmount} ${asset}.`;
    case 'aboveAvailable':
      return `You have ${rules.available} ${asset} available.`;
    case 'notAboveFee':
      return `The amount must be more than the ${rules.fee} ${asset} fee.`;
  }
}
