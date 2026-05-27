import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError, parsePagination } from '../utils/response';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, offset } = parsePagination(req.query as { page?: string; limit?: string });
  const { campaign_id, status, sentiment, lead_qualified, date_from, date_to } = req.query;

  try {
    let query = supabaseAdmin
      .from('calls')
      .select('*, leads(first_name, last_name, phone, company), campaigns(name)', { count: 'exact' })
      .eq('org_id', req.user!.orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (campaign_id) query = query.eq('campaign_id', campaign_id as string);
    if (status) query = query.eq('status', status as string);
    if (sentiment) query = query.eq('sentiment', sentiment as string);
    if (lead_qualified) query = query.eq('lead_qualified', lead_qualified === 'true');
    if (date_from) query = query.gte('created_at', date_from as string);
    if (date_to) query = query.lte('created_at', date_to as string);

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
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch calls', 500);
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('calls')
      .select('*, leads(*), campaigns(name), call_transcripts(*)')
      .eq('id', req.params.id)
      .eq('org_id', req.user!.orgId)
      .single();

    if (error || !data) {
      sendError(res, 'NOT_FOUND', 'Call not found', 404);
      return;
    }

    sendSuccess(res, data);
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch call', 500);
  }
});

router.get('/:id/transcript', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: call } = await supabaseAdmin
      .from('calls')
      .select('id')
      .eq('id', req.params.id)
      .eq('org_id', req.user!.orgId)
      .single();

    if (!call) {
      sendError(res, 'NOT_FOUND', 'Call not found', 404);
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('call_transcripts')
      .select('*')
      .eq('call_id', req.params.id)
      .single();

    if (error) {
      sendError(res, 'NOT_FOUND', 'Transcript not found', 404);
      return;
    }

    sendSuccess(res, data);
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch transcript', 500);
  }
});

router.post('/initiate', async (req: AuthenticatedRequest, res: Response) => {
  const { lead_id, campaign_id } = req.body;

  try {
    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .eq('org_id', req.user!.orgId)
      .single();

    if (!lead) {
      sendError(res, 'NOT_FOUND', 'Lead not found', 404);
      return;
    }

    const { data: campaign } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('id', campaign_id)
      .eq('org_id', req.user!.orgId)
      .single();

    if (!campaign) {
      sendError(res, 'NOT_FOUND', 'Campaign not found', 404);
      return;
    }

    // In production, this would trigger the Twilio call via the voice service
    sendSuccess(res, {
      message: 'Call initiated',
      call_id: 'pending',
      lead_id,
      campaign_id,
      status: 'queued',
    }, 202);
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to initiate call', 500);
  }
});

export default router;
