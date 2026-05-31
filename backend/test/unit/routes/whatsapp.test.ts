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
import whatsappRouter from '../../../src/routes/whatsapp';

const app = makeApp('/whatsapp', whatsappRouter);
const validTemplate = { name: 'T1', language: 'en', content: 'Hi', type: 'reminder' };

describe('routes/whatsapp', () => {
  describe('GET /whatsapp/templates', () => {
    it('returns templates', async () => {
      from.mockReturnValue(chain({ data: [{ id: 't1' }], error: null }));
      const res = await request(app).get('/whatsapp/templates');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([{ id: 't1' }]);
    });
    it('returns an empty list when data is null', async () => {
      from.mockReturnValue(chain({ data: null, error: null }));
      const res = await request(app).get('/whatsapp/templates');
      expect(res.body.data).toEqual([]);
    });
    it('returns 400 on DB error', async () => {
      from.mockReturnValue(chain({ data: null, error: { message: 'bad' } }));
      const res = await request(app).get('/whatsapp/templates');
      expect(res.status).toBe(400);
    });
    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/whatsapp/templates');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /whatsapp/templates', () => {
    it('creates a template', async () => {
      from.mockReturnValue(chain({ data: { id: 't1' }, error: null }));
      const res = await request(app).post('/whatsapp/templates').send(validTemplate);
      expect(res.status).toBe(201);
    });
    it('rejects invalid input', async () => {
      const res = await request(app).post('/whatsapp/templates').send({ name: '' });
      expect(res.status).toBe(400);
    });
    it('returns 400 on DB error', async () => {
      from.mockReturnValue(chain({ data: null, error: { message: 'bad' } }));
      const res = await request(app).post('/whatsapp/templates').send(validTemplate);
      expect(res.status).toBe(400);
    });
    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).post('/whatsapp/templates').send(validTemplate);
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /whatsapp/templates/:id', () => {
    it('updates a template', async () => {
      from.mockReturnValue(chain({ data: { id: 't1', content: 'new' }, error: null }));
      const res = await request(app).put('/whatsapp/templates/t1').send({ content: 'new' });
      expect(res.status).toBe(200);
    });
    it('returns 400 on DB error', async () => {
      from.mockReturnValue(chain({ data: null, error: { message: 'bad' } }));
      const res = await request(app).put('/whatsapp/templates/t1').send({ content: 'new' });
      expect(res.status).toBe(400);
    });
    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).put('/whatsapp/templates/t1').send({ content: 'new' });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /whatsapp/send', () => {
    it('queues a message', async () => {
      from
        .mockReturnValueOnce(chain({ data: { phone: '+1999', first_name: 'Jo' } }))
        .mockReturnValueOnce(chain({ data: { name: 'T1' } }));
      const res = await request(app).post('/whatsapp/send').send({ lead_id: 'l1', template_id: 't1' });
      expect(res.status).toBe(202);
      expect(res.body.data.template).toBe('T1');
    });
    it('returns 404 when the lead is missing', async () => {
      from.mockReturnValueOnce(chain({ data: null }));
      const res = await request(app).post('/whatsapp/send').send({ lead_id: 'x', template_id: 't1' });
      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe('Lead not found');
    });
    it('returns 404 when the template is missing', async () => {
      from
        .mockReturnValueOnce(chain({ data: { phone: '+1999', first_name: 'Jo' } }))
        .mockReturnValueOnce(chain({ data: null }));
      const res = await request(app).post('/whatsapp/send').send({ lead_id: 'l1', template_id: 'x' });
      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe('Template not found');
    });
    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).post('/whatsapp/send').send({ lead_id: 'l1', template_id: 't1' });
      expect(res.status).toBe(500);
    });
  });
});
