// The only place the API base URL is defined.
export const API_BASE_URL = 'https://task-api.cashmine.io';

// The browser has no fetch timeout; without one a stalled connection would spin forever.
export const REQUEST_TIMEOUT_MS = 30_000;
