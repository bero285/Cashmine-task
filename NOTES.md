# Notes

## Decisions

- **Balance right after a claim: forward-only snapshots plus waiting for the claim (approach C).**
  Two users complained: "my balance didn't change, so I claimed again" and "my balance dropped,
  then jumped back". Both come from the 15 s snapshot gap. I asked the AI for options without
  letting it pick, and it gave three:
  - **A:** subtract the claim on screen. It reacts instantly, but it is client-side money math and
    can double-count.
  - **B:** leave the numbers alone and show a banner. Simple, but the stale number stays.
  - **C:** never replace a snapshot with an older `asOf`. After a claim, show "Updating…" and poll
    every 3 s until `asOf ≥ claim.createdAt` (give up after 60 s).

  I chose C: every number on screen comes from the server, and the numbers never go backwards. The
  cost is up to 15 s of "Updating…" and some extra requests.
- **Idempotency key persisted in AsyncStorage, tied to the token.** The key is created once per
  claim body (asset, canonical amount, destination) and reused on every retry. A new key is made
  only when the body changes. Key and body are saved before sending and cleared only on a definite
  answer: a claim comes back, or the server refuses (400/401/404/409). A network error, 429, 5xx
  or 504 keeps the draft, because the claim may exist; the retry with the same key returns it
  instead of creating a second one. So a lost response or a reload can't create a second claim.
  After a reload, the claim screen offers "Check and resend" for an unconfirmed draft, but only
  under the token it was made with. Keeping the key only in memory was simpler but unsafe on
  reload. sessionStorage was the AI's proposal; I chose AsyncStorage, which uses localStorage on
  web.
- **Claim flow.** Pick an asset (ones with nothing available are disabled), enter an amount or
  tap Max, see fee and "You receive", then review and confirm. The destination is picked
  automatically when there is only one. Submit retries automatically up to 3 times, only for
  retryable errors, always with the same key. Offline, TanStack pauses the request and sends it
  when the connection is back. On success the claim screen is replaced by the claim's status
  page, so Back goes to Home rather than to a form that was already submitted. The unconfirmed
  banner also has "Discard": it forgets the saved key, so if that claim did reach the server, a
  new one would be a real second claim. I kept it so users can't get stuck on the banner.
- **USD total and rounding.** Total = Σ (available + pending + claiming) × usdPrice, with
  available, pending and claiming shown underneath. The other option was to count available only.
  USD is rounded **down** to the cent so we never overstate money. Each bucket is summed exactly
  and rounded once, so the numbers on screen add up. The trade-off is that the total can be up to
  2 cents under the exact sum.
- **Amount input.** `,` becomes `.`, trailing zeros are stripped before the decimals check, and
  amounts are sent in canonical form (`0.50` → `0.5`) so one value always gives one request body.
  The amount must be greater than the fee.
- **Other.**
  - The token is not validated on save; the first 401 catches a bad token.
  - Retry only network errors, 429 and 5xx; never 400/401/404/409.
  - A 30 s client timeout.
  - Runtime decoders instead of trusting `res.json()`.
  - A Stack with header links instead of tabs.
  - No inline styles.

## Working with AI

Logs are in `ai-logs/`. Times are UTC from the main session.

1. **A prompt that didn't get what I wanted (step 3, ~13:05).** "Proceed with step 3" got me a
   plain-text token field. On a 401 it only showed an error on Home. I changed the prompt to spell
   the behaviour out: a 401 must send the user back to the token screen, the token is hidden by
   default with Show/Hide, and the template's inline styles get removed too. Since then I state
   the expected behaviour for each step, not just its name. → `ai-logs/TODO` (~13:10)
2. **AI output that was wrong (Refresh label, ~13:36).** The AI built "Updated … ago" from `asOf`
   only. Tests passed and the code looked right. I found the bug by running the app: clicking
   Refresh made the call but often didn't reset the label. The cause: the server only rebuilds
   snapshots every 15 s, so a refresh returns the same `asOf`. Smaller catches, found in
   screenshots or self-review:
   - long amounts overflowed the card at 320 px;
   - a hydration mismatch after I switched back to `server` output;
   - a wrong comment saying the per-asset USD values add up to the total;
   - in step 5, a `tsc` error from `asset` being set twice in the claim rules, and a "Discard"
     button that was invisible inside its card (same background colour).

   → `ai-logs/TODO` (~13:36)
3. **Rejected suggestions.**
   - The AI rejected `1.0` for a 0-decimal asset because it counted the trailing zero as a
     decimal place. I overruled it: strip trailing zeros first, since a user typing `1.0` means 1.
     I also replaced its sessionStorage plan for the idempotency key with AsyncStorage.
   - I didn't let it fix the Refresh label (it proposed two labels) because there wasn't time.

   → `ai-logs/TODO` (~12:34, ~12:50)

## Not done / known issues

- **Claim flow: done, but only tested against a fake API.** Checked at 390 px in headless Chrome
  with a fake API injected into the page:
  - the form ("0,5" accepted; too many decimals rejected with a clear message);
  - review and confirm;
  - a lost first response (the retry used the same key; one claim was created);
  - "Check and resend" after a reload (the saved key was reused);
  - a draft saved under another token is not offered;
  - approach C on Home.

  Still to do with a real token: submit, the 409 case, and an amount above the live available.
- **Server validation errors** (e.g. an amount above the live available) are shown on the review
  step with "Go back to change the claim". They are not mapped onto the amount field yet.
- **Approach C limits:**
  - The wait is in memory only, so after a reload the normal 15 s refresh applies.
  - It does not block a second claim.
  - If the server labels lazily built snapshots with an older `asOf`, "Updating…" can last one
    extra 15 s cycle. The numbers stay correct.
- **Claim tracking:** the status page shows the claim as returned, but doesn't poll yet.
  Polling `GET /v1/claims/{id}` until completed/failed, showing `failureReason`, and refetching
  balances after the claim settles are not done.
- **Activity:** not started.
- **Refresh label:** it shows the snapshot age, so a Refresh inside the 15 s window doesn't show
  "just now". Planned fix: "Checked just now" (`dataUpdatedAt`) next to "Snapshot from 12 s ago"
  (`asOf`).
- **Not yet checked against the live API:** whether `asOf ≥ createdAt` really means the claim is
  included (approach C depends on this). The same goes for the USD rounding review point.
- **UI tests:** none. `@testing-library/react-native` isn't on the allowed list, so the screens
  were checked by hand and with headless Chrome at 390/320 px.
