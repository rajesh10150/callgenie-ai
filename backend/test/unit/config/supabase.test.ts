const createClient = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...a: unknown[]) => createClient(...a),
}));
jest.mock('ws', () => ({}));

describe('config/supabase', () => {
  const ORIGINAL = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    createClient.mockReset();
    process.env = { ...ORIGINAL };
    process.env.SUPABASE_URL = 'https://x.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service';
  });

  afterAll(() => {
    process.env = { ...ORIGINAL };
  });

  it('lazily creates and caches the admin client via the proxy', () => {
    const fakeClient = { auth: { signOut: jest.fn() }, from: jest.fn() };
    createClient.mockReturnValue(fakeClient);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { supabaseAdmin } = require('../../../src/config/supabase');

    // Access a function property -> triggers lazy init and binds the function.
    expect(typeof supabaseAdmin.from).toBe('function');
    // Access again -> cached (createClient still called once).
    void supabaseAdmin.auth;
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith('https://x.supabase.co', 'service', expect.any(Object));
  });

  it('throws via the proxy when admin env vars are missing', () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { supabaseAdmin } = require('../../../src/config/supabase');
    expect(() => supabaseAdmin.from).toThrow(/Supabase is not configured/);
  });

  it('creates and caches the anon client', () => {
    const fakeAnon = { auth: {} };
    createClient.mockReturnValue(fakeAnon);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getSupabaseAnon } = require('../../../src/config/supabase');
    const a = getSupabaseAnon();
    const b = getSupabaseAnon();
    expect(a).toBe(b);
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith('https://x.supabase.co', 'anon', expect.any(Object));
  });

  it('throws when anon env vars are missing', () => {
    delete process.env.SUPABASE_ANON_KEY;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getSupabaseAnon } = require('../../../src/config/supabase');
    expect(() => getSupabaseAnon()).toThrow(/Supabase is not configured/);
  });

  it('creates a per-request client with an Authorization header', () => {
    createClient.mockReturnValue({});
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createSupabaseClient } = require('../../../src/config/supabase');
    createSupabaseClient('tok123');
    const opts = createClient.mock.calls[0][2] as { global: { headers: { Authorization: string } } };
    expect(opts.global.headers.Authorization).toBe('Bearer tok123');
  });

  it('throws when creating a per-request client without config', () => {
    delete process.env.SUPABASE_ANON_KEY;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createSupabaseClient } = require('../../../src/config/supabase');
    expect(() => createSupabaseClient('tok')).toThrow(/Supabase is not configured/);
  });
});
