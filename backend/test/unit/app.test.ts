import request from 'supertest';
import { chain } from '../helpers/supabase';

const from = jest.fn();
jest.mock('../../src/config/supabase', () => ({ supabaseAdmin: { from: (...a: unknown[]) => from(...a) } }));

// eslint-disable-next-line @typescript-eslint/no-var-requires
import app from '../../src/app';

describe('app', () => {
  it('serves the root info route', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('CallGenie AI API');
  });

  it('mounts the API routers under /api/v1', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'bad' });
    expect(res.status).toBe(400);
  });

  describe('GET /api/health', () => {
    it('reports connected when Supabase responds without error', async () => {
      from.mockReturnValue(chain({ error: null }));
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.supabase).toEqual({ configured: true, connected: true });
    });

    it('reports disconnected when Supabase returns an error', async () => {
      from.mockReturnValue(chain({ error: { message: 'down' } }));
      const res = await request(app).get('/api/health');
      expect(res.body.supabase.connected).toBe(false);
    });

    it('reports disconnected when the query throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/api/health');
      expect(res.body.supabase.connected).toBe(false);
    });
  });

  describe('CORS', () => {
    it('allows a configured origin', async () => {
      from.mockReturnValue(chain({ error: null }));
      const res = await request(app).get('/').set('Origin', 'http://localhost:3000');
      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });

    it('allows (but warns on) an unconfigured origin', async () => {
      from.mockReturnValue(chain({ error: null }));
      const res = await request(app).get('/').set('Origin', 'http://evil.example');
      expect(res.status).toBe(200);
    });
  });
});
