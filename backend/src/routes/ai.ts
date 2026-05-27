import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { aiOrchestrator } from '../services/aiOrchestrator';

const router = Router();

router.use(authenticate);

router.get('/models', async (_req: AuthenticatedRequest, res: Response) => {
  const models = aiOrchestrator.getAvailableModels();
  sendSuccess(res, models);
});

router.post('/generate-script', async (req: AuthenticatedRequest, res: Response) => {
  const { industry, product, target_audience, tone, language, objectives } = req.body;

  try {
    const script = await aiOrchestrator.generateCallScript({
      industry,
      product,
      targetAudience: target_audience,
      tone: tone || 'professional',
      language: language || 'en',
      objectives: objectives || ['qualify_lead'],
    });

    sendSuccess(res, script);
  } catch {
    sendError(res, 'AI_ERROR', 'Failed to generate script', 500);
  }
});

router.post('/analyze-transcript', async (req: AuthenticatedRequest, res: Response) => {
  const { transcript } = req.body;

  if (!transcript) {
    sendError(res, 'VALIDATION_ERROR', 'Transcript is required');
    return;
  }

  try {
    const analysis = await aiOrchestrator.analyzeConversation(transcript);
    sendSuccess(res, analysis);
  } catch {
    sendError(res, 'AI_ERROR', 'Failed to analyze transcript', 500);
  }
});

router.post('/handle-objection', async (req: AuthenticatedRequest, res: Response) => {
  const { objection, industry, product, language } = req.body;

  if (!objection) {
    sendError(res, 'VALIDATION_ERROR', 'Objection text is required');
    return;
  }

  try {
    const response = await aiOrchestrator.handleObjection(objection, {
      industry: industry || 'general',
      product: product || 'service',
      language: language || 'en',
    });

    sendSuccess(res, { response });
  } catch {
    sendError(res, 'AI_ERROR', 'Failed to generate response', 500);
  }
});

router.post('/test', async (req: AuthenticatedRequest, res: Response) => {
  const { model, prompt } = req.body;

  try {
    const response = await aiOrchestrator.generateResponse(
      [{ role: 'user', content: prompt }],
      model || 'gpt-4.1',
      { temperature: 0.7, maxTokens: 512 }
    );

    sendSuccess(res, response);
  } catch {
    sendError(res, 'AI_ERROR', 'AI model test failed', 500);
  }
});

export default router;
