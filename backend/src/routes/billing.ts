import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.use(authenticate);

router.get('/subscription', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('org_id', req.user!.orgId)
      .single();

    if (error || !data) {
      sendSuccess(res, {
        plan: 'free',
        status: 'active',
        call_minutes_limit: 30,
        call_minutes_used: 0,
        ai_credits_limit: 100,
        ai_credits_used: 0,
      });
      return;
    }

    sendSuccess(res, data);
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch subscription', 500);
  }
});

router.get('/usage', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user!.orgId;

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('call_minutes_limit, call_minutes_used, ai_credits_limit, ai_credits_used')
      .eq('org_id', orgId)
      .single();

    const { data: calls } = await supabaseAdmin
      .from('calls')
      .select('duration_seconds, cost, ai_cost, voice_cost')
      .eq('org_id', orgId)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    const totalMinutes = Math.ceil(
      (calls || []).reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / 60
    );
    const totalCost = (calls || []).reduce((sum, c) => sum + (c.cost || 0), 0);

    sendSuccess(res, {
      call_minutes: {
        used: subscription?.call_minutes_used || totalMinutes,
        limit: subscription?.call_minutes_limit || 30,
      },
      ai_credits: {
        used: subscription?.ai_credits_used || 0,
        limit: subscription?.ai_credits_limit || 100,
      },
      costs: {
        total: totalCost,
        ai: (calls || []).reduce((sum, c) => sum + (c.ai_cost || 0), 0),
        voice: (calls || []).reduce((sum, c) => sum + (c.voice_cost || 0), 0),
      },
    });
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch usage', 500);
  }
});

router.get('/invoices', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('org_id', req.user!.orgId)
      .order('created_at', { ascending: false });

    if (error) {
      sendError(res, 'DB_ERROR', error.message);
      return;
    }

    sendSuccess(res, data || []);
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch invoices', 500);
  }
});

router.post('/subscribe', async (req: AuthenticatedRequest, res: Response) => {
  const { plan } = req.body;
  const validPlans = ['starter', 'professional', 'enterprise'];

  if (!validPlans.includes(plan)) {
    sendError(res, 'VALIDATION_ERROR', 'Invalid plan');
    return;
  }

  // In production, this would create a Stripe checkout session
  sendSuccess(res, {
    message: 'Subscription upgrade initiated',
    plan,
    checkout_url: `https://checkout.stripe.com/placeholder/${plan}`,
  });
});

export default router;
