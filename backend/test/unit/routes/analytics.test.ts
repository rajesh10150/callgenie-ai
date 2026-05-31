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
import analyticsRouter from '../../../src/routes/analytics';

const app = makeApp('/analytics', analyticsRouter);

describe('routes/analytics', () => {
  describe('GET /analytics/dashboard', () => {
    it('aggregates counts and recent data', async () => {
      from
        .mockReturnValueOnce(chain({ count: 5 }))
        .mockReturnValueOnce(chain({ count: 10 }))
        .mockReturnValueOnce(chain({ count: 2 }))
        .mockReturnValueOnce(chain({ count: 3 }))
        .mockReturnValueOnce(chain({ count: 1 }))
        .mockReturnValueOnce(chain({ data: [{ id: 'call1' }] }))
        .mockReturnValueOnce(chain({ data: [{ id: 'camp1' }] }));

      const res = await request(app).get('/analytics/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.data.overview).toMatchObject({
        total_calls: 5, total_leads: 10, total_campaigns: 2,
        qualified_leads: 3, appointments_booked: 1,
      });
      expect(res.body.data.recent_calls).toEqual([{ id: 'call1' }]);
      expect(res.body.data.active_campaigns).toEqual([{ id: 'camp1' }]);
    });

    it('falls back to zeros and empty lists when data is null', async () => {
      from
        .mockReturnValueOnce(chain({ count: null }))
        .mockReturnValueOnce(chain({ count: null }))
        .mockReturnValueOnce(chain({ count: null }))
        .mockReturnValueOnce(chain({ count: null }))
        .mockReturnValueOnce(chain({ count: null }))
        .mockReturnValueOnce(chain({ data: null }))
        .mockReturnValueOnce(chain({ data: null }));

      const res = await request(app).get('/analytics/dashboard');
      expect(res.body.data.overview.total_calls).toBe(0);
      expect(res.body.data.recent_calls).toEqual([]);
      expect(res.body.data.active_campaigns).toEqual([]);
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/analytics/dashboard');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /analytics/calls', () => {
    const sampleCalls = [
      { status: 'completed', sentiment: 'positive', duration_seconds: 60, lead_qualified: true, appointment_booked: true, cost: 0.1 },
      { status: 'no_answer', sentiment: 'neutral', duration_seconds: 0, lead_qualified: false, appointment_booked: false, cost: 0 },
      { status: 'failed', sentiment: 'negative', duration_seconds: 30, lead_qualified: false, appointment_booked: false, cost: 0.05 },
    ];

    it('computes call stats for period 7d', async () => {
      from.mockReturnValue(chain({ data: sampleCalls }));
      const res = await request(app).get('/analytics/calls').query({ period: '7d' });
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(3);
      expect(res.body.data.completed).toBe(1);
      expect(res.body.data.no_answer).toBe(1);
      expect(res.body.data.failed).toBe(1);
      expect(res.body.data.avg_duration).toBe(30);
      expect(res.body.data.total_cost).toBeCloseTo(0.15);
      expect(res.body.data.sentiment_distribution).toEqual({ positive: 1, neutral: 1, negative: 1 });
    });

    it('supports period 30d', async () => {
      from.mockReturnValue(chain({ data: sampleCalls }));
      const res = await request(app).get('/analytics/calls').query({ period: '30d' });
      expect(res.status).toBe(200);
    });

    it('supports period 90d', async () => {
      from.mockReturnValue(chain({ data: sampleCalls }));
      const res = await request(app).get('/analytics/calls').query({ period: '90d' });
      expect(res.status).toBe(200);
    });

    it('defaults the period and handles no calls', async () => {
      from.mockReturnValue(chain({ data: null }));
      const res = await request(app).get('/analytics/calls');
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.avg_duration).toBe(0);
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/analytics/calls');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /analytics/leads', () => {
    it('computes lead stats', async () => {
      const leads = [
        { status: 'new', source: 'manual', score: 10 },
        { status: 'qualified', source: 'csv_import', score: 90 },
        { status: 'converted', source: 'api', score: 50 },
        { status: 'contacted', source: 'webhook', score: 0 },
        { status: 'unqualified', source: 'whatsapp', score: 0 },
        { status: 'lost', source: 'manual', score: 0 },
      ];
      from.mockReturnValue(chain({ data: leads }));
      const res = await request(app).get('/analytics/leads');
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(6);
      expect(res.body.data.by_status.new).toBe(1);
      expect(res.body.data.by_source.manual).toBe(2);
      expect(res.body.data.avg_score).toBe(25);
    });

    it('handles no leads', async () => {
      from.mockReturnValue(chain({ data: null }));
      const res = await request(app).get('/analytics/leads');
      expect(res.body.data.total).toBe(0);
      expect(res.body.data.avg_score).toBe(0);
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/analytics/leads');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /analytics/campaigns', () => {
    it('computes per-campaign rates', async () => {
      from.mockReturnValue(chain({
        data: [
          { id: 'c1', calls_made: 10, calls_answered: 5, leads_qualified: 2, appointments_booked: 1 },
          { id: 'c2', calls_made: 0, calls_answered: 0, leads_qualified: 0, appointments_booked: 0 },
        ],
      }));
      const res = await request(app).get('/analytics/campaigns');
      expect(res.status).toBe(200);
      expect(res.body.data[0]).toMatchObject({ answer_rate: 0.5, qualification_rate: 0.4, booking_rate: 0.5 });
      expect(res.body.data[1]).toMatchObject({ answer_rate: 0, qualification_rate: 0, booking_rate: 0 });
    });

    it('handles no campaigns', async () => {
      from.mockReturnValue(chain({ data: null }));
      const res = await request(app).get('/analytics/campaigns');
      expect(res.body.data).toEqual([]);
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/analytics/campaigns');
      expect(res.status).toBe(500);
    });
  });
});
