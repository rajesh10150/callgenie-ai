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
import leadsRouter from '../../../src/routes/leads';

const app = makeApp('/leads', leadsRouter);

describe('routes/leads', () => {
  describe('GET /leads', () => {
    it('returns paginated leads with all filters applied', async () => {
      const builder = chain({ data: [{ id: 'l1' }], count: 1, error: null });
      from.mockReturnValue(builder);

      const res = await request(app)
        .get('/leads')
        .query({ status: 'new,contacted', source: 'manual', score_min: '50', search: 'a,b.c*', sort: 'first_name', order: 'asc', page: '2', limit: '10' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: [{ id: 'l1' }],
        meta: { page: 2, limit: 10, total: 1, totalPages: 1 },
      });
      expect(builder.in).toHaveBeenCalledWith('status', ['new', 'contacted']);
      expect(builder.gte).toHaveBeenCalledWith('score', 50);
      expect(builder.or).toHaveBeenCalled();
      expect(builder.order).toHaveBeenCalledWith('first_name', { ascending: true });
    });

    it('uses defaults when no filters are provided', async () => {
      const builder = chain({ data: [], count: 0, error: null });
      from.mockReturnValue(builder);

      const res = await request(app).get('/leads');

      expect(res.status).toBe(200);
      expect(res.body.meta.total).toBe(0);
      expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('returns 400 on DB error', async () => {
      from.mockReturnValue(chain({ data: null, count: null, error: { message: 'db down' } }));
      const res = await request(app).get('/leads');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('DB_ERROR');
    });

    it('returns 500 when the query throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/leads');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /leads', () => {
    it('creates a lead and logs an activity', async () => {
      from
        .mockReturnValueOnce(chain({ data: { id: 'l1' }, error: null }))
        .mockReturnValueOnce(chain({ data: null, error: null }));

      const res = await request(app).post('/leads').send({ first_name: 'Jo', phone: '1234567890' });

      expect(res.status).toBe(201);
      expect(res.body.data).toEqual({ id: 'l1' });
      expect(from).toHaveBeenCalledWith('leads');
      expect(from).toHaveBeenCalledWith('lead_activities');
    });

    it('returns 400 when validation fails', async () => {
      const res = await request(app).post('/leads').send({ first_name: '' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 on DB error', async () => {
      from.mockReturnValueOnce(chain({ data: null, error: { message: 'bad' } }));
      const res = await request(app).post('/leads').send({ first_name: 'Jo', phone: '1234567890' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('DB_ERROR');
    });

    it('returns 500 when insert throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).post('/leads').send({ first_name: 'Jo', phone: '1234567890' });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /leads/import', () => {
    it('imports an array of leads', async () => {
      from.mockReturnValue(chain({ data: [{ id: 'a' }, { id: 'b' }], error: null }));
      const res = await request(app).post('/leads/import').send({ leads: [{ first_name: 'A', phone: '111' }, {}] });
      expect(res.status).toBe(201);
      expect(res.body.data).toEqual({ imported: 2, total: 2 });
    });

    it('rejects an empty or missing leads array', async () => {
      const res = await request(app).post('/leads/import').send({ leads: [] });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 on DB error', async () => {
      from.mockReturnValue(chain({ data: null, error: { message: 'bad' } }));
      const res = await request(app).post('/leads/import').send({ leads: [{ first_name: 'A' }] });
      expect(res.status).toBe(400);
    });

    it('returns 500 when import throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).post('/leads/import').send({ leads: [{ first_name: 'A' }] });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /leads/:id', () => {
    it('returns a single lead', async () => {
      from.mockReturnValue(chain({ data: { id: 'l1' }, error: null }));
      const res = await request(app).get('/leads/l1');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual({ id: 'l1' });
    });

    it('returns 404 when not found', async () => {
      from.mockReturnValue(chain({ data: null, error: null }));
      const res = await request(app).get('/leads/missing');
      expect(res.status).toBe(404);
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/leads/l1');
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /leads/:id', () => {
    it('updates a lead', async () => {
      from.mockReturnValue(chain({ data: { id: 'l1', first_name: 'New' }, error: null }));
      const res = await request(app).put('/leads/l1').send({ first_name: 'New' });
      expect(res.status).toBe(200);
      expect(res.body.data.first_name).toBe('New');
    });

    it('returns 400 on DB error', async () => {
      from.mockReturnValue(chain({ data: null, error: { message: 'bad' } }));
      const res = await request(app).put('/leads/l1').send({ first_name: 'New' });
      expect(res.status).toBe(400);
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).put('/leads/l1').send({ first_name: 'New' });
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /leads/:id', () => {
    it('deletes a lead', async () => {
      from.mockReturnValue(chain({ data: null, error: null }));
      const res = await request(app).delete('/leads/l1');
      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Lead deleted');
    });

    it('returns 400 on DB error', async () => {
      from.mockReturnValue(chain({ data: null, error: { message: 'bad' } }));
      const res = await request(app).delete('/leads/l1');
      expect(res.status).toBe(400);
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).delete('/leads/l1');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /leads/:id/activities', () => {
    it('returns paginated activities', async () => {
      from.mockReturnValue(chain({ data: [{ id: 'act1' }], count: 1, error: null }));
      const res = await request(app).get('/leads/l1/activities');
      expect(res.status).toBe(200);
      expect(res.body.meta.total).toBe(1);
    });

    it('returns 400 on DB error', async () => {
      from.mockReturnValue(chain({ data: null, count: null, error: { message: 'bad' } }));
      const res = await request(app).get('/leads/l1/activities');
      expect(res.status).toBe(400);
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/leads/l1/activities');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /leads/:id/tags', () => {
    it('adds a tag', async () => {
      from.mockReturnValue(chain({ data: { id: 't1', tag: 'vip' }, error: null }));
      const res = await request(app).post('/leads/l1/tags').send({ tag: 'vip' });
      expect(res.status).toBe(201);
      expect(res.body.data.tag).toBe('vip');
    });

    it('returns 400 on DB error', async () => {
      from.mockReturnValue(chain({ data: null, error: { message: 'bad' } }));
      const res = await request(app).post('/leads/l1/tags').send({ tag: 'vip' });
      expect(res.status).toBe(400);
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).post('/leads/l1/tags').send({ tag: 'vip' });
      expect(res.status).toBe(500);
    });
  });
});
