import api from '@/lib/api';

const BASE = 'http://localhost:3001/api/v1';

function mockFetch(payload: unknown = { success: true, data: null }) {
  const fn = jest.fn().mockResolvedValue({ json: async () => payload });
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

describe('lib/api ApiClient', () => {
  beforeEach(() => {
    api.clearToken();
    window.localStorage.clear();
  });

  it('sends a GET without an Authorization header when no token exists', async () => {
    const fetchMock = mockFetch();
    await api.get('/health');
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/health`);
    expect(opts.headers.Authorization).toBeUndefined();
    expect(opts.headers['Content-Type']).toBe('application/json');
  });

  it('uses an explicitly set token', async () => {
    const fetchMock = mockFetch();
    api.setToken('explicit-token');
    await api.get('/me');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer explicit-token');
  });

  it('falls back to the token stored in localStorage', async () => {
    const fetchMock = mockFetch();
    window.localStorage.setItem('callgenie_token', 'stored-token');
    await api.get('/me');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer stored-token');
  });

  it('serializes a POST body', async () => {
    const fetchMock = mockFetch();
    await api.post('/leads', { name: 'A' });
    const opts = fetchMock.mock.calls[0][1];
    expect(opts.method).toBe('POST');
    expect(opts.body).toBe(JSON.stringify({ name: 'A' }));
  });

  it('omits the body for a POST without payload', async () => {
    const fetchMock = mockFetch();
    await api.post('/ping');
    expect(fetchMock.mock.calls[0][1].body).toBeUndefined();
  });

  it('serializes a PUT body and supports DELETE', async () => {
    const fetchMock = mockFetch();
    await api.put('/leads/1', { name: 'B' });
    expect(fetchMock.mock.calls[0][1].method).toBe('PUT');
    await api.delete('/leads/1');
    expect(fetchMock.mock.calls[1][1].method).toBe('DELETE');
  });

  it('returns the parsed JSON response', async () => {
    mockFetch({ success: true, data: { id: '1' } });
    const res = await api.get<{ id: string }>('/leads/1');
    expect(res).toEqual({ success: true, data: { id: '1' } });
  });
});
