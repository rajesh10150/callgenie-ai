const create = jest.fn();

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: { completions: { create: (...a: unknown[]) => create(...a) } },
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
import { AIOrchestrator } from '../../../src/services/aiOrchestrator';

const orchestrator = new AIOrchestrator();

describe('services/aiOrchestrator', () => {
  describe('selectModel', () => {
    it('returns the preferred model when provided', () => {
      expect(orchestrator.selectModel({ strategy: 'smart', language: 'en', taskComplexity: 'low', preferredModel: 'claude' })).toBe('claude');
    });

    it('routes "fast" by language', () => {
      expect(orchestrator.selectModel({ strategy: 'fast', language: 'en', taskComplexity: 'low' })).toBe('deepseek');
      expect(orchestrator.selectModel({ strategy: 'fast', language: 'hi', taskComplexity: 'low' })).toBe('gemini');
    });

    it('routes "low_cost" to deepseek', () => {
      expect(orchestrator.selectModel({ strategy: 'low_cost', language: 'en', taskComplexity: 'high' })).toBe('deepseek');
    });

    it('routes "smart" by complexity and language', () => {
      expect(orchestrator.selectModel({ strategy: 'smart', language: 'en', taskComplexity: 'high' })).toBe('gpt-4.1');
      expect(orchestrator.selectModel({ strategy: 'smart', language: 'hi', taskComplexity: 'low' })).toBe('gemini');
      expect(orchestrator.selectModel({ strategy: 'smart', language: 'en', taskComplexity: 'low' })).toBe('claude');
    });

    it('routes "sales_optimized" by complexity and language', () => {
      expect(orchestrator.selectModel({ strategy: 'sales_optimized', language: 'en', taskComplexity: 'high' })).toBe('gpt-4.1');
      expect(orchestrator.selectModel({ strategy: 'sales_optimized', language: 'hi', taskComplexity: 'low' })).toBe('gemini');
      expect(orchestrator.selectModel({ strategy: 'sales_optimized', language: 'en', taskComplexity: 'low' })).toBe('gpt-4.1');
    });

    it('falls back to gpt-4.1 for an unknown strategy', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(orchestrator.selectModel({ strategy: 'mystery' as any, language: 'en', taskComplexity: 'low' })).toBe('gpt-4.1');
    });
  });

  describe('generateResponse', () => {
    it('returns content, model, tokens and computed cost', async () => {
      create.mockResolvedValue({ usage: { total_tokens: 1000 }, choices: [{ message: { content: 'hello' } }] });
      const res = await orchestrator.generateResponse([{ role: 'user', content: 'hi' }], 'gpt-4.1', { temperature: 0.5, maxTokens: 100 });
      expect(res).toEqual({ content: 'hello', model: 'gpt-4.1', tokensUsed: 1000, cost: 0.03 });
    });

    it('applies defaults when usage and content are missing', async () => {
      create.mockResolvedValue({ choices: [] });
      const res = await orchestrator.generateResponse([{ role: 'user', content: 'hi' }]);
      expect(res.content).toBe('');
      expect(res.tokensUsed).toBe(0);
      expect(res.cost).toBe(0);
      expect(create).toHaveBeenCalledWith(expect.objectContaining({ temperature: 0.7, max_tokens: 1024 }));
    });
  });

  describe('generateCallScript', () => {
    const params = { industry: 'real_estate', product: 'house', targetAudience: 'buyers', tone: 'friendly', language: 'hi', objectives: ['qualify_lead'] };

    it('parses a JSON script response', async () => {
      create.mockResolvedValue({ usage: { total_tokens: 10 }, choices: [{ message: { content: JSON.stringify({ opening: 'Hi', qualificationQuestions: [], objectionHandlers: {}, closing: 'Bye' }) } }] });
      const res = await orchestrator.generateCallScript(params);
      expect(res.opening).toBe('Hi');
    });

    it('falls back when the response is not valid JSON', async () => {
      create.mockResolvedValue({ usage: { total_tokens: 10 }, choices: [{ message: { content: 'not json' } }] });
      const res = await orchestrator.generateCallScript({ ...params, language: 'en' });
      expect(res).toEqual({ opening: 'not json', qualificationQuestions: [], objectionHandlers: {}, closing: '' });
    });
  });

  describe('analyzeConversation', () => {
    it('parses a JSON analysis response', async () => {
      create.mockResolvedValue({ usage: { total_tokens: 10 }, choices: [{ message: { content: JSON.stringify({ sentiment: 'positive', leadQualified: true, score: 90, keyPoints: [], suggestedFollowUp: 'call' }) } }] });
      const res = await orchestrator.analyzeConversation('transcript');
      expect(res.sentiment).toBe('positive');
    });

    it('falls back when the response is not valid JSON', async () => {
      create.mockResolvedValue({ usage: { total_tokens: 10 }, choices: [{ message: { content: 'oops' } }] });
      const res = await orchestrator.analyzeConversation('transcript');
      expect(res).toMatchObject({ sentiment: 'neutral', leadQualified: false, score: 50 });
    });
  });

  describe('handleObjection', () => {
    it('returns the generated rebuttal', async () => {
      create.mockResolvedValue({ usage: { total_tokens: 10 }, choices: [{ message: { content: 'rebuttal' } }] });
      const res = await orchestrator.handleObjection('too pricey', { industry: 'x', product: 'y', language: 'en' });
      expect(res).toBe('rebuttal');
    });
  });

  describe('model registry helpers', () => {
    it('returns model info for a known model', () => {
      expect(orchestrator.getModelInfo('claude').provider).toBe('anthropic');
    });

    it('lists all available models', () => {
      const models = orchestrator.getAvailableModels();
      expect(models).toHaveLength(4);
      expect(models.map(m => m.model)).toEqual(expect.arrayContaining(['gpt-4.1', 'claude', 'gemini', 'deepseek']));
    });
  });
});
