import { apiRequest } from '@/services/api-client';
import { ApiError, InvalidResponseError, NetworkError } from '@/services/api-error';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '@/services/config';

type FetchArgs = [input: string | URL | Request, init?: RequestInit];

const fetchMock = jest.fn<Promise<Response>, FetchArgs>();
const originalFetch = globalThis.fetch;

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock;
});

afterAll(() => {
  globalThis.fetch = originalFetch;
});

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers });

const decodeText = (data: unknown): string => {
  if (typeof data !== 'string') throw new InvalidResponseError('expected a string');
  return data;
};

const request = () => apiRequest('/v1/x', { token: 'tok', decode: decodeText });

const rejection = async (promise: Promise<unknown>): Promise<unknown> => {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('expected the request to fail');
};

describe('apiRequest', () => {
  it('sends the bearer token and returns the decoded body', async () => {
    fetchMock.mockResolvedValue(json(200, 'ok'));

    await expect(request()).resolves.toBe('ok');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_BASE_URL}/v1/x`);
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer tok');
  });

  it('sends a JSON body and extra headers on POST', async () => {
    fetchMock.mockResolvedValue(json(201, 'ok'));

    await apiRequest('/v1/x', {
      token: 'tok',
      decode: decodeText,
      method: 'POST',
      body: { a: '1' },
      headers: { 'Idempotency-Key': 'key-1' },
    });

    const init = fetchMock.mock.calls[0][1];
    const headers = new Headers(init?.headers);
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe('{"a":"1"}');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('Idempotency-Key')).toBe('key-1');
  });

  it('maps the error envelope to an ApiError', async () => {
    fetchMock.mockResolvedValue(
      json(400, { error: { code: 'VALIDATION', message: 'Too much', field: 'amount' } }),
    );

    const error = await rejection(request());
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, code: 'VALIDATION', field: 'amount' });
  });

  it('takes retryAfterMs from the body on 429', async () => {
    fetchMock.mockResolvedValue(
      json(429, { error: { code: 'RATE_LIMITED', message: 'x', retryAfterMs: 2300 } }),
    );

    expect(await rejection(request())).toMatchObject({ code: 'RATE_LIMITED', retryAfterMs: 2300 });
  });

  it('falls back to the Retry-After header (seconds) on 429', async () => {
    fetchMock.mockResolvedValue(json(429, {}, { 'Retry-After': '3' }));

    expect(await rejection(request())).toMatchObject({ code: 'RATE_LIMITED', retryAfterMs: 3000 });
  });

  it('maps a non-JSON 5xx to a SERVER error', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }));

    expect(await rejection(request())).toMatchObject({ status: 502, code: 'SERVER' });
  });

  it('maps a failed fetch to a NetworkError', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    expect(await rejection(request())).toBeInstanceOf(NetworkError);
  });

  it('throws InvalidResponseError when a 2xx body does not match', async () => {
    fetchMock.mockResolvedValue(json(200, { not: 'a string' }));

    expect(await rejection(request())).toBeInstanceOf(InvalidResponseError);
  });

  it('gives up with a NetworkError after the timeout', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );

    const pending = rejection(request());
    jest.advanceTimersByTime(REQUEST_TIMEOUT_MS);

    expect(await pending).toBeInstanceOf(NetworkError);
    jest.useRealTimers();
  });
});
