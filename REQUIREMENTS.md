# Requirements

Source: task brief + API docs (https://task-api.cashmine.io/docs).
`[ ]` = not done, `[x]` = done and verified in code. Items marked _(implied)_ are not stated in the
brief but follow from it or from the API docs.

## Decisions

- Total USD = Σ (available + pending + claiming) × usdPrice; below it show the USD of available
  now, pending and claiming separately.
- USD is rounded **down** to the cent (never overstate money).
- `,` typed as the decimal separator is converted to `.` before validation; otherwise strict.
- Web output is `single` (static SPA); not hosted on EAS.
- Idempotency key for an unconfirmed claim is persisted in AsyncStorage so a reload cannot create
  a duplicate claim.
- Token is stored with AsyncStorage (localStorage on web).
- Activity: one list, newest first, as the API returns it; no filters.
- The token is not validated on save; a bad token is detected by the first 401.
- No inline styles anywhere, including the template's ThemedText/ThemedView (per-scheme StyleSheets).
- Claim amounts are sent in canonical form ("0.50" → "0.5"), so one value always gives one body.
- Trailing zeros are stripped before the decimal-places check: "1.0" is accepted as 1.
- A claim must be greater than its fee (receive amount > 0).
- ESLint (`eslint`, `eslint-config-expo`) kept as dev dependencies for `expo lint`.

## Review later

- [ ] USD bucket rounding: each bucket (available, pending, claiming) is summed exactly across
      assets and then rounded down; the total is the sum of the rounded buckets so the screen adds
      up. Trade-off: the total can be up to 2 cents below the exact grand total rounded down.

## 0. Platform & constraints

- [ ] Runs in the browser via `npx expo start --web`
- [ ] Layout designed for a ~390 px phone screen; content stays readable on wider screens _(implied)_
- [ ] Deployed link that works when opened on a phone _(implied: "we will open your link")_
- [x] API base URL defined in exactly one place
- [ ] No token in code, repo or build
- [ ] Only allowed libraries (TanStack Query + Expo template)
- [ ] `npx expo lint` and `npx tsc --noEmit` pass

## 1. Token

- [x] On first open, ask for the token (text field)
- [x] Token stored in the browser and reused on reload
- [x] A way to change the token
- [x] Changing the token clears all cached data from the previous token _(implied: data is per token)_
- [ ] 401 UNAUTHORIZED (invalid/expired) on any request forgets the token and returns the user to
      the token screen with a "token not accepted" notice _(decision)_ — wired via the query and
      mutation caches; tick once a screen makes API calls and it is verified
- [x] Token field hidden by default, with a Show/Hide button _(decision)_
- [x] Empty / whitespace-only token cannot be saved; surrounding whitespace is trimmed _(implied)_

## 2. API layer

- [ ] Every request goes through TanStack Query
- [x] Responses and errors strictly typed, no `any`
- [x] Error envelope `{ error: { code, message, field?, retryAfterMs? } }` parsed into a typed error _(implied)_
- [x] Network failures (no response) are a separate typed error _(implied)_
- [x] Retry only retryable failures: network, 429, 500, 503, 504. Never retry 400/401/404/409 _(implied)_
- [x] 429 waits `retryAfterMs` (or `Retry-After`) before retrying _(implied)_
- [x] Client-side request timeout (30 s) so a stalled connection becomes a retryable error _(implied)_
- [x] API payloads checked at runtime; a malformed 2xx body is a typed, non-retryable error _(implied)_
- [ ] Amounts are kept as strings from the API; never JSON numbers, `Number` or `parseFloat`

## 3. Money logic

- [x] Amount format: digits, optional dot + digits, no leading zeros (`0.5`, `12` ok; `.5`, `1.`, `05`, `1e-3` rejected)
- [x] At most `decimals` decimal places per asset
- [x] All math in `bigint` base units (scaled by `decimals`)
- [x] Fee: receive = amount − fee
- [x] USD value per asset and total computed exactly with `bigint`, rounded only for display _(implied)_
- [ ] Crypto amounts displayed without rounding or float conversion _(implied)_

## 4. Balances (Home)

- [ ] Each asset: available, pending, claiming
- [ ] Total in USD (available + pending + claiming)
- [ ] Below the total: USD of available now, pending and claiming
- [ ] Data freshness from `asOf` (e.g. "updated 12 s ago"), ticking live _(implied)_
- [ ] Loading state
- [ ] Error state with retry
- [ ] Empty state (no assets)
- [ ] Manual refresh (button; pull-to-refresh is a no-op on web)
- [ ] Refresh-in-progress indicator while keeping current data visible _(implied)_
- [ ] Failed background refresh keeps the last data and shows that it may be stale _(implied)_
- [ ] Balances recompute every 15 s; claims may not show up until the next snapshot, and the user is told _(implied)_

## 5. Claim

- [ ] Pick an asset
- [ ] Load claim options for that asset (minAmount, fee, destinations), with loading/error/retry
- [ ] Choose a destination (`destinationId` is required; pick automatically when there is only one) _(implied)_
- [ ] Enter an amount or tap Max (= available)
- [ ] Validate: format, decimals, `minAmount <= amount <= available`
- [ ] Amount must be greater than the fee so the receive amount is positive _(implied)_
- [ ] Show fee and amount to receive before confirming
- [ ] Confirm step, then submit
- [ ] No double submit: button disabled while the request is in flight _(implied)_
- [ ] `Idempotency-Key` created once per claim body and reused on every retry of that body _(implied: lost responses, 504)_
- [ ] New key only when the body (asset, amount, destination) changes _(implied)_
- [ ] Key + body persisted in AsyncStorage before sending; cleared only on a definite answer
      (claim returned, or 400/409) _(decision 5)_
- [ ] After a reload, an unconfirmed submission is offered for resubmission with the same key
      (server replays the original claim if it was created) _(implied by decision 5)_
- [ ] A persisted unconfirmed claim is never resubmitted under a different token _(implied)_
- [ ] Network error / 5xx / 504 on submit: outcome unknown, user can retry safely with the same key _(implied)_
- [ ] Server VALIDATION errors shown on the matching field (`field`), e.g. amount above live available _(implied)_
- [ ] 409 IDEMPOTENCY_MISMATCH handled with a clear message _(implied)_
- [ ] Assets with nothing available cannot be claimed, with a clear reason _(implied)_

## 6. Claim tracking

- [ ] After submit, open the claim's status view
- [ ] Poll `GET /v1/claims/{id}` while `pending`; stop at `completed` / `failed`
- [ ] Show `failureReason` when failed
- [ ] Status view works after reload (claim id in the URL) _(implied)_
- [ ] Loading, error/retry and not-found states _(implied)_
- [ ] Balances (and activity) refetched after claim creation and after it settles _(implied)_

## 7. Tests

- [x] Unit tests: amount parsing
- [x] Unit tests: validation (format, decimals, min, max/available, fee)
- [x] Unit tests: fee / receive amount
- [x] Unit tests: USD totals
- [x] Unit tests: comma → dot normalisation, USD round-down
- [x] `npm test` runs Jest (`jest-expo` preset) _(implied)_

## 8. Activity (if time allows)

- [ ] Paginated history (cursor, `limit` 1–20)
- [ ] Types: accrual, reversal, claim with status, signed amount, exchange, date
- [ ] Load more / infinite scroll
- [ ] Loading, error/retry, empty states; error on a later page keeps the loaded pages
