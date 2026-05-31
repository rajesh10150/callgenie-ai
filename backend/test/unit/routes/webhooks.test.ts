import request from 'supertest';
import { chain } from '../../helpers/supabase';
import { makeApp } from '../../helpers/app';

const from = jest.fn();
const generateResponse = jest.fn();

jest.mock('../../../src/config/supabase', () => ({
  supabaseAdmin: { from: (...a: unknown[]) => from(...a) },
}));
jest.mock('../../../src/services/aiOrchestrator', () => ({
  aiOrchestrator: { generateResponse: (...a: unknown[]) => generateResponse(...a) },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
import webhooksRouter from '../../../src/routes/webhooks';

const app = makeApp('/webhooks', webhooksRouter, true);

describe('routes/webhooks', () => {
  describe('POST /webhooks/twilio/voice', () => {
    it('returns greeting TwiML', async () => {
      const res = await request(app).post('/webhooks/twilio/voice').type('form').send({ CallSid: 'CA1' });
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('xml');
      expect(res.text).toContain('CallGenie AI');
    });
  });

  describe('POST /webhooks/twilio/status', () => {
    it('maps status and records a hangup event on completion', async () => {
      const updateChain = chain({ error: null });
      from
        .mockReturnValueOnce(updateChain) // calls update
        .mockReturnValueOnce(chain({ data: { id: 'call1' } })) // calls lookup
        .mockReturnValueOnce(chain({ error: null })); // call_events insert
      const res = await request(app).post('/webhooks/twilio/status').type('form')
        .send({ CallSid: 'CA1', CallStatus: 'completed', CallDuration: '42', RecordingUrl: 'http://rec' });
      expect(res.status).toBe(200);
      expect(res.body.data.received).toBe(true);
      expect(updateChain.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed', duration_seconds: 42 }));
    });

    it('skips the hangup event for non-terminal status', async () => {
      from.mockReturnValueOnce(chain({ error: null }));
      const res = await request(app).post('/webhooks/twilio/status').type('form')
        .send({ CallSid: 'CA1', CallStatus: 'ringing' });
      expect(res.status).toBe(200);
      expect(from).toHaveBeenCalledTimes(1);
    });

    it('passes through an unmapped status verbatim', async () => {
      const updateChain = chain({ error: null });
      from.mockReturnValueOnce(updateChain);
      await request(app).post('/webhooks/twilio/status').type('form')
        .send({ CallSid: 'CA1', CallStatus: 'unknown_status' });
      expect(updateChain.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'unknown_status' }));
    });

    it('handles completion when the call record is missing', async () => {
      from
        .mockReturnValueOnce(chain({ error: null }))
        .mockReturnValueOnce(chain({ data: null }));
      const res = await request(app).post('/webhooks/twilio/status').type('form')
        .send({ CallSid: 'CA1', CallStatus: 'completed' });
      expect(res.status).toBe(200);
      expect(from).toHaveBeenCalledTimes(2);
    });

    it('returns 500 on error', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).post('/webhooks/twilio/status').type('form').send({ CallSid: 'CA1' });
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('WEBHOOK_ERROR');
    });
  });

  describe('POST /webhooks/twilio/recording', () => {
    it('updates the recording url', async () => {
      const updateChain = chain({ error: null });
      from.mockReturnValueOnce(updateChain);
      const res = await request(app).post('/webhooks/twilio/recording').type('form')
        .send({ CallSid: 'CA1', RecordingUrl: 'http://rec', RecordingDuration: '12' });
      expect(res.status).toBe(200);
      expect(updateChain.update).toHaveBeenCalledWith(expect.objectContaining({ duration_seconds: 12 }));
    });

    it('returns 500 on error', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).post('/webhooks/twilio/recording').type('form').send({ CallSid: 'CA1' });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /webhooks/twilio/gather', () => {
    it('uses the AI response and logs a speech event', async () => {
      generateResponse.mockResolvedValue({ content: 'Sure, I can help.' });
      from
        .mockReturnValueOnce(chain({ data: { id: 'call1' } }))
        .mockReturnValueOnce(chain({ error: null }));
      const res = await request(app).post('/webhooks/twilio/gather').type('form')
        .send({ SpeechResult: 'I need info', CallSid: 'CA1' });
      expect(res.status).toBe(200);
      expect(res.text).toContain('Sure, I can help.');
    });

    it('falls back when the AI call fails', async () => {
      generateResponse.mockRejectedValue(new Error('ai down'));
      from
        .mockReturnValueOnce(chain({ data: { id: 'call1' } }))
        .mockReturnValueOnce(chain({ error: null }));
      const res = await request(app).post('/webhooks/twilio/gather').type('form')
        .send({ SpeechResult: 'hello', CallSid: 'CA1' });
      expect(res.status).toBe(200);
      expect(res.text).toContain('I heard: hello');
    });

    it('uses a default message when there is no speech', async () => {
      from.mockReturnValueOnce(chain({ data: { id: 'call1' } })).mockReturnValueOnce(chain({ error: null }));
      const res = await request(app).post('/webhooks/twilio/gather').type('form').send({ CallSid: 'CA1' });
      expect(res.status).toBe(200);
      expect(generateResponse).not.toHaveBeenCalled();
      expect(res.text).toContain('Thank you for your response');
    });

    it('escapes XML special characters in the AI response', async () => {
      generateResponse.mockResolvedValue({ content: 'A & B < C > "D" \'E\'' });
      from.mockReturnValueOnce(chain({ data: { id: 'call1' } })).mockReturnValueOnce(chain({ error: null }));
      const res = await request(app).post('/webhooks/twilio/gather').type('form')
        .send({ SpeechResult: 'x', CallSid: 'CA1' });
      expect(res.text).toContain('A &amp; B &lt; C &gt; &quot;D&quot; &apos;E&apos;');
    });

    it('skips logging when the call is missing', async () => {
      generateResponse.mockResolvedValue({ content: 'ok' });
      from.mockReturnValueOnce(chain({ data: null }));
      const res = await request(app).post('/webhooks/twilio/gather').type('form')
        .send({ SpeechResult: 'x', CallSid: 'CA1' });
      expect(res.status).toBe(200);
      expect(from).toHaveBeenCalledTimes(1);
    });

    it('returns a transfer message TwiML on error', async () => {
      generateResponse.mockResolvedValue({ content: 'ok' });
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).post('/webhooks/twilio/gather').type('form')
        .send({ SpeechResult: 'x', CallSid: 'CA1' });
      expect(res.status).toBe(200);
      expect(res.text).toContain('transfer you to a human agent');
    });
  });
});
