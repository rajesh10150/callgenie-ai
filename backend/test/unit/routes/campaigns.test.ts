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
import campaignsRouter from '../../../src/routes/campaigns';

const app = makeApp('/campaigns', campaignsRouter);
const validCampaign = { name: 'C1', type: 'cold_call' };

describe('routes/campaigns', () => {
  describe('GET /campaigns', () => {
    it('lists campaigns with a status filter', async () => {
      const builder = chain({ data: [{ id: 'c1' }], count: 1, error: null });
      from.mockReturnValue(builder);
      const res = await request(app).get('/campaigns').query({ status: 'active' });
      expect(res.status).toBe(200);
      expect(builder.eq).toHaveBeenCalledWith('status', 'active');
      expect(res.body.meta.total).toBe(1);
    });

    it('lists campaigns without a filter', async () => {
      from.mockReturnValue(chain({ data: [], count: 0, error: null }));
      const res = await request(app).get('/campaigns');
      expect(res.status).toBe(200);
    });

    it('returns 400 on DB error', async () => {
      from.mockReturnValue(chain({ data: null, count: null, error: { message: 'bad' } }));
      const res = await request(app).get('/campaigns');
      expect(res.status).toBe(400);
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/campaigns');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /campaigns', () => {
    it('creates a campaign', async () => {
      from.mockReturnValue(chain({ data: { id: 'c1' }, error: null }));
      const res = await request(app).post('/campaigns').send(validCampaign);
      expect(res.status).toBe(201);
    });

    it('rejects invalid input', async () => {
      const res = await request(app).post('/campaigns').send({ name: '' });
      expect(res.status).toBe(400);
    });

    it('returns 400 on DB error', async () => {
      from.mockReturnValue(chain({ data: null, error: { message: 'bad' } }));
      const res = await request(app).post('/campaigns').send(validCampaign);
      expect(res.status).toBe(400);
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).post('/campaigns').send(validCampaign);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /campaigns/:id', () => {
    it('returns a campaign', async () => {
      from.mockReturnValue(chain({ data: { id: 'c1' }, error: null }));
      const res = await request(app).get('/campaigns/c1');
      expect(res.status).toBe(200);
    });
    it('returns 404 when missing', async () => {
      from.mockReturnValue(chain({ data: null, error: null }));
      const res = await request(app).get('/campaigns/x');
      expect(res.status).toBe(404);
    });
    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/campaigns/c1');
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /campaigns/:id', () => {
    it('updates a campaign', async () => {
      from.mockReturnValue(chain({ data: { id: 'c1' }, error: null }));
      const res = await request(app).put('/campaigns/c1').send({ name: 'New' });
      expect(res.status).toBe(200);
    });
    it('returns 400 on DB error', async () => {
      from.mockReturnValue(chain({ data: null, error: { message: 'bad' } }));
      const res = await request(app).put('/campaigns/c1').send({ name: 'New' });
      expect(res.status).toBe(400);
    });
    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).put('/campaigns/c1').send({ name: 'New' });
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /campaigns/:id', () => {
    it('deletes a campaign', async () => {
      from.mockReturnValue(chain({ data: null, error: null }));
      const res = await request(app).delete('/campaigns/c1');
      expect(res.status).toBe(200);
    });
    it('returns 400 on DB error', async () => {
      from.mockReturnValue(chain({ data: null, error: { message: 'bad' } }));
      const res = await request(app).delete('/campaigns/c1');
      expect(res.status).toBe(400);
    });
    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).delete('/campaigns/c1');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /campaigns/:id/start', () => {
    it('starts a campaign', async () => {
      from.mockReturnValue(chain({ data: { id: 'c1', status: 'active' }, error: null }));
      const res = await request(app).post('/campaigns/c1/start');
      expect(res.status).toBe(200);
    });
    it('returns INVALID_STATE when not startable', async () => {
      from.mockReturnValue(chain({ data: null, error: null }));
      const res = await request(app).post('/campaigns/c1/start');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_STATE');
    });
    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).post('/campaigns/c1/start');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /campaigns/:id/pause', () => {
    it('pauses a campaign', async () => {
      from.mockReturnValue(chain({ data: { id: 'c1', status: 'paused' }, error: null }));
      const res = await request(app).post('/campaigns/c1/pause');
      expect(res.status).toBe(200);
    });
    it('returns INVALID_STATE when not pausable', async () => {
      from.mockReturnValue(chain({ data: null, error: null }));
      const res = await request(app).post('/campaigns/c1/pause');
      expect(res.status).toBe(400);
    });
    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).post('/campaigns/c1/pause');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /campaigns/:id/stats', () => {
    it('computes rates from campaign counters', async () => {
      from.mockReturnValue(chain({
        data: { total_leads: 10, calls_made: 8, calls_answered: 4, leads_qualified: 2, appointments_booked: 1 },
        error: null,
      }));
      const res = await request(app).get('/campaigns/c1/stats');
      expect(res.status).toBe(200);
      expect(res.body.data.answer_rate).toBe(0.5);
      expect(res.body.data.qualification_rate).toBe(0.5);
      expect(res.body.data.progress).toBe(0.8);
    });

    it('returns zero rates when counters are zero', async () => {
      from.mockReturnValue(chain({
        data: { total_leads: 0, calls_made: 0, calls_answered: 0, leads_qualified: 0, appointments_booked: 0 },
        error: null,
      }));
      const res = await request(app).get('/campaigns/c1/stats');
      expect(res.body.data).toMatchObject({ answer_rate: 0, qualification_rate: 0, progress: 0 });
    });

    it('returns 404 when campaign is missing', async () => {
      from.mockReturnValue(chain({ data: null, error: null }));
      const res = await request(app).get('/campaigns/c1/stats');
      expect(res.status).toBe(404);
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/campaigns/c1/stats');
      expect(res.status).toBe(500);
    });
  });
});
