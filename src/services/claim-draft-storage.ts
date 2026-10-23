import AsyncStorage from '@react-native-async-storage/async-storage';

import { parseClaimDraft, type ClaimDraft } from '@/utils/claim-draft';

// One draft at a time: the claim screen submits one claim at a time.
const STORAGE_KEY = 'cashmine.claimDraft';

// Storage failures are swallowed: the in-memory retry (same key) still protects this session;
// only the reload protection is lost.
export async function loadClaimDraft(): Promise<ClaimDraft | null> {
  try {
    return parseClaimDraft(await AsyncStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export async function saveClaimDraft(draft: ClaimDraft): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {}
}

export async function clearClaimDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {}
}
