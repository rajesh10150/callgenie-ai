import request from 'supertest';
import { chain } from '../../helpers/supabase';
import { makeApp } from '../../helpers/app';

const from = jest.fn();

jest.mock('../../../src/config/supabase', () => ({
  supabaseAdmin: { from: (...a: unknown[]) => from(...a) },
}));
jest.mock('../../../src/middleware/auth', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { id: 'u1', email: 'a@b.com', orgId: 'org1', role: 'owner' };
    next();
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
import billingRouter from '../../../src/routes/billing';

const app = makeApp('/billing', billingRouter);

describe('routes/billing', () => {
  describe('GET /billing/subscription', () => {
    it('returns an existing subscription', async () => {
      from.mockReturnValue(chain({ data: { plan: 'professional' }, error: null }));
      const res = await request(app).get('/billing/subscription');
      expect(res.status).toBe(200);
      expect(res.body.data.plan).toBe('professional');
    });

    it('returns a default free plan when none exists', async () => {
      from.mockReturnValue(chain({ data: null, error: null }));
      const res = await request(app).get('/billing/subscription');
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ plan: 'free', call_minutes_limit: 30 });
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/billing/subscription');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /billing/usage', () => {
    it('uses subscription values and sums call costs', async () => {
      from
        .mockReturnValueOnce(chain({ data: { call_minutes_used: 5, call_minutes_limit: 100, ai_credits_used: 10, ai_credits_limit: 200 } }))
        .mockReturnValueOnce(chain({ data: [{ duration_seconds: 120, cost: 1, ai_cost: 0.5, voice_cost: 0.5 }] }));
      const res = await request(app).get('/billing/usage');
      expect(res.status).toBe(200);
      expect(res.body.data.call_minutes).toEqual({ used: 5, limit: 100 });
      expect(res.body.data.ai_credits).toEqual({ used: 10, limit: 200 });
      expect(res.body.data.costs).toEqual({ total: 1, ai: 0.5, voice: 0.5 });
    });

    it('falls back to computed/default values when subscription and calls are absent', async () => {
      from
        .mockReturnValueOnce(chain({ data: null }))
        .mockReturnValueOnce(chain({ data: null }));
      const res = await request(app).get('/billing/usage');
      expect(res.body.data.call_minutes).toEqual({ used: 0, limit: 30 });
      expect(res.body.data.ai_credits).toEqual({ used: 0, limit: 100 });
      expect(res.body.data.costs).toEqual({ total: 0, ai: 0, voice: 0 });
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/billing/usage');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /billing/invoices', () => {
    it('returns invoices', async () => {
      from.mockReturnValue(chain({ data: [{ id: 'inv1' }], error: null }));
      const res = await request(app).get('/billing/invoices');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([{ id: 'inv1' }]);
    });

    it('returns an empty list when data is null', async () => {
      from.mockReturnValue(chain({ data: null, error: null }));
      const res = await request(app).get('/billing/invoices');
      expect(res.body.data).toEqual([]);
    });

    it('returns 400 on DB error', async () => {
      from.mockReturnValue(chain({ data: null, error: { message: 'bad' } }));
      const res = await request(app).get('/billing/invoices');
      expect(res.status).toBe(400);
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/billing/invoices');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /billing/subscribe', () => {
    it('initiates an upgrade for a valid plan', async () => {
      const res = await request(app).post('/billing/subscribe').send({ plan: 'professional' });
      expect(res.status).toBe(200);
      expect(res.body.data.checkout_url).toContain('professional');
    });

    it('rejects an invalid plan', async () => {
      const res = await request(app).post('/billing/subscribe').send({ plan: 'gold' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
