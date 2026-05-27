import { Router, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../config/supabase';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { sendSuccess, sendError, parsePagination } from '../utils/response';

const router = Router();

const createLeadSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10),
  company: z.string().optional(),
  title: z.string().optional(),
  source: z.enum(['manual', 'csv_import', 'api', 'webhook', 'whatsapp']).default('manual'),
  language: z.string().default('en'),
  timezone: z.string().optional(),
  custom_fields: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
});

const updateLeadSchema = createLeadSchema.partial();

router.use(authenticate);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, offset } = parsePagination(req.query as { page?: string; limit?: string });
  const { status, source, search, sort, order, score_min } = req.query;

  try {
    let query = supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('org_id', req.user!.orgId);

    if (status) {
      const statuses = (status as string).split(',');
      query = query.in('status', statuses);
    }

    if (source) {
      query = query.eq('source', source as string);
    }

    if (score_min) {
      query = query.gte('score', parseInt(score_min as string, 10));
    }

    if (search) {
      const sanitized = (search as string).replace(/[,.*()]/g, '');
      query = query.or(
        `first_name.ilike.%${sanitized}%,last_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,phone.ilike.%${sanitized}%,company.ilike.%${sanitized}%`
      );
    }

    const sortField = (sort as string) || 'created_at';
    const sortOrder = order === 'asc';
    query = query.order(sortField, { ascending: sortOrder }).range(offset, offset + limit - 1);

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
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch leads', 500);
  }
});

router.post('/', validate(createLeadSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert({
        id: uuidv4(),
        org_id: req.user!.orgId,
        ...req.body,
        status: 'new',
        score: 0,
      })
      .select()
      .single();

    if (error) {
      sendError(res, 'DB_ERROR', error.message);
      return;
    }

    await supabaseAdmin.from('lead_activities').insert({
      id: uuidv4(),
      lead_id: data.id,
      org_id: req.user!.orgId,
      type: 'status_change',
      description: 'Lead created',
      metadata: { source: req.body.source },
    });

    sendSuccess(res, data, 201);
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to create lead', 500);
  }
});

router.post('/import', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { leads } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      sendError(res, 'VALIDATION_ERROR', 'No leads provided');
      return;
    }

    const leadsToInsert = leads.map((lead: Record<string, unknown>) => ({
      id: uuidv4(),
      org_id: req.user!.orgId,
      first_name: lead.first_name || '',
      last_name: lead.last_name || '',
      email: lead.email || null,
      phone: lead.phone || '',
      company: lead.company || null,
      title: lead.title || null,
      source: 'csv_import',
      status: 'new',
      score: 0,
      language: lead.language || 'en',
      custom_fields: lead.custom_fields || {},
    }));

    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert(leadsToInsert)
      .select();

    if (error) {
      sendError(res, 'DB_ERROR', error.message);
      return;
    }

    sendSuccess(res, {
      imported: data?.length || 0,
      total: leads.length,
    }, 201);
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to import leads', 500);
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('*, lead_tags(*)')
      .eq('id', req.params.id)
      .eq('org_id', req.user!.orgId)
      .single();

    if (error || !data) {
      sendError(res, 'NOT_FOUND', 'Lead not found', 404);
      return;
    }

    sendSuccess(res, data);
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch lead', 500);
  }
});

router.put('/:id', validate(updateLeadSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('leads')
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
    sendError(res, 'INTERNAL_ERROR', 'Failed to update lead', 500);
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error } = await supabaseAdmin
      .from('leads')
      .delete()
      .eq('id', req.params.id)
      .eq('org_id', req.user!.orgId);

    if (error) {
      sendError(res, 'DB_ERROR', error.message);
      return;
    }

    sendSuccess(res, { message: 'Lead deleted' });
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to delete lead', 500);
  }
});

router.get('/:id/activities', async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, offset } = parsePagination(req.query as { page?: string; limit?: string });

  try {
    const { data, count, error } = await supabaseAdmin
      .from('lead_activities')
      .select('*', { count: 'exact' })
      .eq('lead_id', req.params.id)
      .eq('org_id', req.user!.orgId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

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
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch activities', 500);
  }
});

router.post('/:id/tags', async (req: AuthenticatedRequest, res: Response) => {
  const { tag } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('lead_tags')
      .insert({
        id: uuidv4(),
        lead_id: req.params.id,
        tag,
      })
      .select()
      .single();

    if (error) {
      sendError(res, 'DB_ERROR', error.message);
      return;
    }

    sendSuccess(res, data, 201);
  } catch {
    sendError(res, 'INTERNAL_ERROR', 'Failed to add tag', 500);
  }
});

export default router;
