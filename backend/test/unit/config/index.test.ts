describe('config/index', () => {
  const ORIGINAL = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL };
    jest.resetModules();
  });

  it('parses values from environment variables', () => {
    jest.resetModules();
    process.env.PORT = '8080';
    process.env.NODE_ENV = 'production';
    process.env.SUPABASE_URL = 'https://x.supabase.co';
    process.env.CORS_ORIGIN = 'https://a.com, https://b.com';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { config } = require('../../../src/config');
    expect(config.port).toBe(8080);
    expect(config.nodeEnv).toBe('production');
    expect(config.supabase.url).toBe('https://x.supabase.co');
    expect(config.cors.origins).toEqual(['https://a.com', 'https://b.com']);
    expect(config.rateLimit).toEqual({ windowMs: 60000, max: 100 });
  });

  it('applies defaults when optional env vars are unset', () => {
    jest.resetModules();
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.SUPABASE_URL;
    delete process.env.CORS_ORIGIN;
    delete process.env.REDIS_URL;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { config } = require('../../../src/config');
    expect(config.port).toBe(3001);
    expect(config.nodeEnv).toBe('development');
    expect(config.supabase.url).toBe('');
    expect(config.redis.url).toBe('redis://localhost:6379');
    expect(config.cors.origins).toEqual(['http://localhost:3000']);
  });
});
