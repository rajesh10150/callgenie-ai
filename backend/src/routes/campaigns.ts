import { Router, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { sendSuccess, sendError, parsePagination } from '../utils/response';

const router = Router();

const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.enum(['cold_call', 'follow_up', 'appointment', 'survey']),
  language: z.enum(['en', 'hi', 'kn', 'ta', 'te']).default('en'),
  ai_model: z.enum(['gpt-4.1', 'claude', 'gemini', 'deepseek']).default('gpt-4.1'),
  voice_id: z.string().optional(),
  caller_id: z.string().optional(),
  schedule: z.object({
    days: z.array(z.string()),
    start_time: z.string(),
    end_time: z.string(),
    timezone: z.string(),
    max_concurrent_calls: z.number().min(1).max(50).default(5),
  }).optional(),
  settings: z.object({
    max_attempts: z.number().min(1).max(10).default(3),
    retry_interval_hours: z.number().min(1).default(24),
    voicemail_detection: z.boolean().default(true),
    recording_enabled: z.boolean().default(true),
  }).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

const updateCampaignSchema = createCampaignSchema.partial();

router.use(authenticate);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, offset } = parsePagination(req.query as { page?: string; limit?: string });
  const status = req.query.status as string | undefined;

  try {
    let query = supabaseAdmin
      .from('campaigns')
      .select('*', { count: 'exact' })
      .eq('org_id', req.user!.orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query;

    if (error) {
      sendError(res, 'DB_ERROR', error.message);
      return;
    }

    sendSuccess(res, data, 200, {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch campaigns', 500);
  }
});

router.post('/', validate(createCampaignSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .insert({
        id: uuidv4(),
        org_id: req.user!.orgId,
        ...req.body,
        status: 'draft',
        total_leads: 0,
        calls_made: 0,
        calls_answered: 0,
        leads_qualified: 0,
        appointments_booked: 0,
      })
      .select()
      .single();

    if (error) {
      sendError(res, 'DB_ERROR', error.message);
      return;
    }

    sendSuccess(res, data, 201);
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to create campaign', 500);
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*, campaign_scripts(*)')
      .eq('id', req.params.id)
      .eq('org_id', req.user!.orgId)
      .single();

    if (error || !data) {
      sendError(res, 'NOT_FOUND', 'Campaign not found', 404);
      return;
    }

    sendSuccess(res, data);
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch campaign', 500);
  }
});

router.put('/:id', validate(updateCampaignSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('org_id', req.user!.orgId)
      .select()
      .single();

    if (error) {
      sendError(res, 'DB_ERROR', error.message);
      return;
    }

    sendSuccess(res, data);
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to update campaign', 500);
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error } = await supabaseAdmin
      .from('campaigns')
      .delete()
      .eq('id', req.params.id)
      .eq('org_id', req.user!.orgId);

    if (error) {
      sendError(res, 'DB_ERROR', error.message);
      return;
    }

    sendSuccess(res, { message: 'Campaign deleted' });
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to delete campaign', 500);
  }
});

router.post('/:id/start', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('org_id', req.user!.orgId)
      .in('status', ['draft', 'paused'])
      .select()
      .single();

    if (error || !data) {
      sendError(res, 'INVALID_STATE', 'Campaign cannot be started');
      return;
    }

    sendSuccess(res, data);
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to start campaign', 500);
  }
});

router.post('/:id/pause', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update({ status: 'paused', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('org_id', req.user!.orgId)
      .eq('status', 'active')
      .select()
      .single();

    if (error || !data) {
      sendError(res, 'INVALID_STATE', 'Campaign cannot be paused');
      return;
    }

    sendSuccess(res, data);
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to pause campaign', 500);
  }
});

router.get('/:id/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: campaign } = await supabaseAdmin
      .from('campaigns')
      .select('total_leads, calls_made, calls_answered, leads_qualified, appointments_booked')
      .eq('id', req.params.id)
      .eq('org_id', req.user!.orgId)
      .single();

    if (!campaign) {
      sendError(res, 'NOT_FOUND', 'Campaign not found', 404);
      return;
    }

    const answerRate = campaign.calls_made > 0
      ? campaign.calls_answered / campaign.calls_made
      : 0;

    const qualificationRate = campaign.calls_answered > 0
      ? campaign.leads_qualified / campaign.calls_answered
      : 0;

    sendSuccess(res, {
      ...campaign,
      answer_rate: answerRate,
      qualification_rate: qualificationRate,
      progress: campaign.total_leads > 0
        ? campaign.calls_made / campaign.total_leads
        : 0,
    });
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch stats', 500);
  }
});

export default router;
