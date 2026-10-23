# CashMine payback (take-home)

**Live:** TODO_LIVE_LINK (EAS Hosting)

A web build of the CashMine mobile app, sized for a ~390 px phone screen. On first open it asks for
an API token. The token is stored in the browser and never shipped in the code or the build.

## Run locally

```bash
npm install
npx expo start --web     # open the printed URL, paste your token
npm test                 # unit tests (Jest, jest-expo preset)
npx expo lint
npx tsc --noEmit
```

Deploy: `npx expo export --platform web`, then `npx eas-cli@latest deploy` (`web.output` is `server`).

## What works

- **Token:** asked for on first open, hidden by default with a Show/Hide button, saved in the
  browser and changeable from Home. Changing it clears all cached data. A 401 on any request
  forgets the token and returns to the token screen with a "Token not accepted" notice.
- **Balances (Home):** each asset's available, pending and claiming amounts, shown exactly as the
  API sends them. Also: the USD total with an available / pending / claiming breakdown, a live
  "Updated … ago" label from `asOf`, Refresh, auto-refresh every 15 s, and loading, error/retry
  and empty states. A failed refresh keeps the last data on screen and says it may be stale.
- **API layer:** every request goes through TanStack Query, with typed errors and runtime-checked
  payloads. Only network errors, 429 and 5xx are retried; a 429 waits `retryAfterMs`. Requests
  time out after 30 s.
- **Money logic:** amount parsing, validation (format, decimals, min, available, fee), fee/receive
  and USD totals are all done in `bigint`. All of it is unit tested (159 tests in the suite).
- **Claim:**
  - Pick an asset, enter an amount (`,` accepted as the decimal separator) or tap Max.
  - See the fee and the amount you receive, then review and confirm.
  - Each submission has an `Idempotency-Key`, saved before sending and reused on every retry and
    after a reload. A lost response therefore can't create a second claim.
  - Right after a claim, Home says "Updating after your claim…" and polls every 3 s until a
    snapshot that includes the claim arrives (approach C in [NOTES.md](NOTES.md)).
  - The claim's status page shows the claim as returned. Live status polling is not done yet;
    see "Not done" in [NOTES.md](NOTES.md).
