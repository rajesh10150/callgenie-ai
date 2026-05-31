import request from 'supertest';
import { makeApp } from '../../helpers/app';

const getAvailableModels = jest.fn();
const generateCallScript = jest.fn();
const analyzeConversation = jest.fn();
const handleObjection = jest.fn();
const generateResponse = jest.fn();

jest.mock('../../../src/services/aiOrchestrator', () => ({
  aiOrchestrator: {
    getAvailableModels: (...a: unknown[]) => getAvailableModels(...a),
    generateCallScript: (...a: unknown[]) => generateCallScript(...a),
    analyzeConversation: (...a: unknown[]) => analyzeConversation(...a),
    handleObjection: (...a: unknown[]) => handleObjection(...a),
    generateResponse: (...a: unknown[]) => generateResponse(...a),
  },
}));
jest.mock('../../../src/middleware/auth', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { id: 'u1', email: 'a@b.com', orgId: 'org1', role: 'owner' };
    next();
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
import aiRouter from '../../../src/routes/ai';

const app = makeApp('/ai', aiRouter);

describe('routes/ai', () => {
  describe('GET /ai/models', () => {
    it('returns available models', async () => {
      getAvailableModels.mockReturnValue([{ id: 'gpt-4.1' }]);
      const res = await request(app).get('/ai/models');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([{ id: 'gpt-4.1' }]);
    });
  });

  describe('POST /ai/generate-script', () => {
    it('generates a script with explicit options', async () => {
      generateCallScript.mockResolvedValue({ script: 'hello' });
      const res = await request(app).post('/ai/generate-script').send({
        industry: 'real_estate', product: 'house', target_audience: 'buyers',
        tone: 'friendly', language: 'hi', objectives: ['book_meeting'],
      });
      expect(res.status).toBe(200);
      expect(generateCallScript).toHaveBeenCalledWith(expect.objectContaining({ tone: 'friendly', language: 'hi' }));
    });

    it('applies defaults for optional fields', async () => {
      generateCallScript.mockResolvedValue({ script: 'hi' });
      const res = await request(app).post('/ai/generate-script').send({ industry: 'x', product: 'y' });
      expect(res.status).toBe(200);
      expect(generateCallScript).toHaveBeenCalledWith(expect.objectContaining({
        tone: 'professional', language: 'en', objectives: ['qualify_lead'],
      }));
    });

    it('returns AI_ERROR when generation fails', async () => {
      generateCallScript.mockRejectedValue(new Error('fail'));
      const res = await request(app).post('/ai/generate-script').send({ industry: 'x', product: 'y' });
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('AI_ERROR');
    });
  });

  describe('POST /ai/analyze-transcript', () => {
    it('analyzes a transcript', async () => {
      analyzeConversation.mockResolvedValue({ sentiment: 'positive' });
      const res = await request(app).post('/ai/analyze-transcript').send({ transcript: 'hello there' });
      expect(res.status).toBe(200);
      expect(res.body.data.sentiment).toBe('positive');
    });
    it('requires a transcript', async () => {
      const res = await request(app).post('/ai/analyze-transcript').send({});
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('returns AI_ERROR when analysis fails', async () => {
      analyzeConversation.mockRejectedValue(new Error('fail'));
      const res = await request(app).post('/ai/analyze-transcript').send({ transcript: 'x' });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /ai/handle-objection', () => {
    it('handles an objection with defaults', async () => {
      handleObjection.mockResolvedValue('rebuttal');
      const res = await request(app).post('/ai/handle-objection').send({ objection: 'too expensive' });
      expect(res.status).toBe(200);
      expect(res.body.data.response).toBe('rebuttal');
      expect(handleObjection).toHaveBeenCalledWith('too expensive', expect.objectContaining({ industry: 'general' }));
    });
    it('requires objection text', async () => {
      const res = await request(app).post('/ai/handle-objection').send({});
      expect(res.status).toBe(400);
    });
    it('returns AI_ERROR when it fails', async () => {
      handleObjection.mockRejectedValue(new Error('fail'));
      const res = await request(app).post('/ai/handle-objection').send({ objection: 'x' });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /ai/test', () => {
    it('tests a model with an explicit model id', async () => {
      generateResponse.mockResolvedValue({ content: 'ok' });
      const res = await request(app).post('/ai/test').send({ model: 'claude', prompt: 'hi' });
      expect(res.status).toBe(200);
      expect(generateResponse).toHaveBeenCalledWith(expect.any(Array), 'claude', expect.any(Object));
    });
    it('defaults the model when not provided', async () => {
      generateResponse.mockResolvedValue({ content: 'ok' });
      const res = await request(app).post('/ai/test').send({ prompt: 'hi' });
      expect(res.status).toBe(200);
      expect(generateResponse).toHaveBeenCalledWith(expect.any(Array), 'gpt-4.1', expect.any(Object));
    });
    it('returns AI_ERROR when the test fails', async () => {
      generateResponse.mockRejectedValue(new Error('fail'));
      const res = await request(app).post('/ai/test').send({ prompt: 'hi' });
      expect(res.status).toBe(500);
    });
  });
});
