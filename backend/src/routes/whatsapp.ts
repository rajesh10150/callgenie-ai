import { Router, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

const createTemplateSchema = z.object({
  name: z.string().min(1),
  language: z.enum(['en', 'hi', 'kn', 'ta', 'te']),
  content: z.string().min(1),
  type: z.enum(['follow_up', 'appointment_confirmation', 'reminder']),
});

router.use(authenticate);

router.get('/templates', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('whatsapp_templates')
      .select('*')
      .eq('org_id', req.user!.orgId)
      .order('created_at', { ascending: false });

    if (error) {
      sendError(res, 'DB_ERROR', error.message);
      return;
    }

    sendSuccess(res, data || []);
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch templates', 500);
  }
});

router.post('/templates', validate(createTemplateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('whatsapp_templates')
      .insert({
        id: uuidv4(),
        org_id: req.user!.orgId,
        ...req.body,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      sendError(res, 'DB_ERROR', error.message);
      return;
    }

    sendSuccess(res, data, 201);
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to create template', 500);
  }
});

router.put('/templates/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('whatsapp_templates')
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
    sendError(res, 'INTERNAL_ERROR', 'Failed to update template', 500);
  }
});

router.post('/send', async (req: AuthenticatedRequest, res: Response) => {
  const { lead_id, template_id } = req.body;

  try {
    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('phone, first_name')
      .eq('id', lead_id)
      .eq('org_id', req.user!.orgId)
      .single();

    if (!lead) {
      sendError(res, 'NOT_FOUND', 'Lead not found', 404);
      return;
    }

    const { data: template } = await supabaseAdmin
      .from('whatsapp_templates')
      .select('*')
      .eq('id', template_id)
      .eq('org_id', req.user!.orgId)
      .single();

    if (!template) {
      sendError(res, 'NOT_FOUND', 'Template not found', 404);
      return;
    }

    // In production, this would send via WhatsApp Business API / Twilio
    sendSuccess(res, {
      message: 'WhatsApp message queued',
      to: lead.phone,
      template: template.name,
    }, 202);
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to send message', 500);
  }
});

export default router;
