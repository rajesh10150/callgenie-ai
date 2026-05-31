import request from 'supertest';
import { chain } from '../../helpers/supabase';
import { makeApp } from '../../helpers/app';

const from = jest.fn();
const initiateCall = jest.fn();

jest.mock('../../../src/config/supabase', () => ({
  supabaseAdmin: { from: (...a: unknown[]) => from(...a) },
}));
jest.mock('../../../src/config', () => ({
  config: {
    cors: { origins: ['http://localhost:3000', 'https://app.prod.com'] },
    twilio: { phoneNumber: '+15550000000' },
  },
}));
jest.mock('../../../src/services/voiceEngine', () => ({
  voiceEngine: { initiateCall: (...a: unknown[]) => initiateCall(...a) },
}));
jest.mock('../../../src/middleware/auth', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { id: 'u1', email: 'a@b.com', orgId: 'org1', role: 'owner' };
    next();
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
import callsRouter from '../../../src/routes/calls';

const app = makeApp('/calls', callsRouter);

describe('routes/calls', () => {
  afterEach(() => { delete process.env.BACKEND_PUBLIC_URL; });

  describe('GET /calls', () => {
    it('lists calls with all filters', async () => {
      const builder = chain({ data: [{ id: 'c1' }], count: 1, error: null });
      from.mockReturnValue(builder);
      const res = await request(app).get('/calls').query({
        campaign_id: 'camp1', status: 'completed', sentiment: 'positive',
        lead_qualified: 'true', date_from: '2024-01-01', date_to: '2024-12-31',
      });
      expect(res.status).toBe(200);
      expect(builder.eq).toHaveBeenCalledWith('lead_qualified', true);
      expect(builder.gte).toHaveBeenCalledWith('created_at', '2024-01-01');
      expect(builder.lte).toHaveBeenCalledWith('created_at', '2024-12-31');
    });

    it('lists calls without filters', async () => {
      from.mockReturnValue(chain({ data: [], count: 0, error: null }));
      const res = await request(app).get('/calls');
      expect(res.status).toBe(200);
    });

    it('returns 400 on DB error', async () => {
      from.mockReturnValue(chain({ data: null, count: null, error: { message: 'bad' } }));
      const res = await request(app).get('/calls');
      expect(res.status).toBe(400);
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/calls');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /calls/:id', () => {
    it('returns a call', async () => {
      from.mockReturnValue(chain({ data: { id: 'c1' }, error: null }));
      const res = await request(app).get('/calls/c1');
      expect(res.status).toBe(200);
    });
    it('returns 404 when missing', async () => {
      from.mockReturnValue(chain({ data: null, error: null }));
      const res = await request(app).get('/calls/x');
      expect(res.status).toBe(404);
    });
    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/calls/c1');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /calls/:id/transcript', () => {
    it('returns a transcript', async () => {
      from
        .mockReturnValueOnce(chain({ data: { id: 'c1' }, error: null }))
        .mockReturnValueOnce(chain({ data: { call_id: 'c1', text: 'hi' }, error: null }));
      const res = await request(app).get('/calls/c1/transcript');
      expect(res.status).toBe(200);
      expect(res.body.data.text).toBe('hi');
    });

    it('returns 404 when the call is missing', async () => {
      from.mockReturnValueOnce(chain({ data: null, error: null }));
      const res = await request(app).get('/calls/c1/transcript');
      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe('Call not found');
    });

    it('returns 404 when the transcript is missing', async () => {
      from
        .mockReturnValueOnce(chain({ data: { id: 'c1' }, error: null }))
        .mockReturnValueOnce(chain({ data: null, error: { message: 'none' } }));
      const res = await request(app).get('/calls/c1/transcript');
      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe('Transcript not found');
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/calls/c1/transcript');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /calls/initiate', () => {
    it('initiates a call without a campaign (queued)', async () => {
      from
        .mockReturnValueOnce(chain({ data: { id: 'l1', phone: '+1999' }, error: null }))
        .mockReturnValueOnce(chain({ data: { id: 'call1', status: 'queued' }, error: null }));
      initiateCall.mockResolvedValue({ callSid: 'CA1', status: 'in_progress' });

      const res = await request(app).post('/calls/initiate').send({ lead_id: 'l1' });

      expect(res.status).toBe(202);
      expect(res.body.data.twilio_call_sid).toBe('CA1');
      const arg = initiateCall.mock.calls[0][0];
      expect(arg.statusCallbackUrl).toBe('https://app.prod.com/api/v1/webhooks/twilio/status');
    });

    it('marks demo status and honors BACKEND_PUBLIC_URL', async () => {
      process.env.BACKEND_PUBLIC_URL = 'https://public.example.com';
      from
        .mockReturnValueOnce(chain({ data: { id: 'l1', phone: '+1999' }, error: null }))
        .mockReturnValueOnce(chain({ data: { id: 'call1', status: 'demo' }, error: null }));
      initiateCall.mockResolvedValue({ callSid: 'CA2', status: 'demo_mode' });

      const res = await request(app).post('/calls/initiate').send({ lead_id: 'l1' });

      expect(res.status).toBe(202);
      const arg = initiateCall.mock.calls[0][0];
      expect(arg.webhookUrl).toBe('https://public.example.com/api/v1/webhooks/twilio/voice');
    });

    it('initiates a call with a valid campaign', async () => {
      from
        .mockReturnValueOnce(chain({ data: { id: 'l1', phone: '+1999' }, error: null }))
        .mockReturnValueOnce(chain({ data: { id: 'camp1' }, error: null }))
        .mockReturnValueOnce(chain({ data: { id: 'call1', status: 'queued' }, error: null }));
      initiateCall.mockResolvedValue({ callSid: 'CA3', status: 'queued' });

      const res = await request(app).post('/calls/initiate').send({ lead_id: 'l1', campaign_id: 'camp1' });
      expect(res.status).toBe(202);
    });

    it('returns 404 when the lead is missing', async () => {
      from.mockReturnValueOnce(chain({ data: null, error: null }));
      const res = await request(app).post('/calls/initiate').send({ lead_id: 'x' });
      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe('Lead not found');
    });

    it('returns 404 when the campaign is missing', async () => {
      from
        .mockReturnValueOnce(chain({ data: { id: 'l1', phone: '+1999' }, error: null }))
        .mockReturnValueOnce(chain({ data: null, error: null }));
      const res = await request(app).post('/calls/initiate').send({ lead_id: 'l1', campaign_id: 'bad' });
      expect(res.status).toBe(404);
      expect(res.body.error.message).toBe('Campaign not found');
    });

    it('returns 400 on insert error', async () => {
      from
        .mockReturnValueOnce(chain({ data: { id: 'l1', phone: '+1999' }, error: null }))
        .mockReturnValueOnce(chain({ data: null, error: { message: 'insert failed' } }));
      initiateCall.mockResolvedValue({ callSid: 'CA1', status: 'queued' });
      const res = await request(app).post('/calls/initiate').send({ lead_id: 'l1' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('DB_ERROR');
    });

    it('returns 500 with the error message when voiceEngine throws an Error', async () => {
      from.mockReturnValueOnce(chain({ data: { id: 'l1', phone: '+1999' }, error: null }));
      initiateCall.mockRejectedValue(new Error('twilio down'));
      const res = await request(app).post('/calls/initiate').send({ lead_id: 'l1' });
      expect(res.status).toBe(500);
      expect(res.body.error.message).toBe('twilio down');
    });

    it('returns 500 with a fallback message for non-Error throws', async () => {
      from.mockReturnValueOnce(chain({ data: { id: 'l1', phone: '+1999' }, error: null }));
      initiateCall.mockRejectedValue('weird');
      const res = await request(app).post('/calls/initiate').send({ lead_id: 'l1' });
      expect(res.status).toBe(500);
      expect(res.body.error.message).toBe('Failed to initiate call');
    });
  });
});
