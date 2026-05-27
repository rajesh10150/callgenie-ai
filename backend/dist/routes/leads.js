"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const supabase_1 = require("../config/supabase");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
const createLeadSchema = zod_1.z.object({
    first_name: zod_1.z.string().min(1),
    last_name: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().min(10),
    company: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    source: zod_1.z.enum(['manual', 'csv_import', 'api', 'webhook', 'whatsapp']).default('manual'),
    language: zod_1.z.string().default('en'),
    timezone: zod_1.z.string().optional(),
    custom_fields: zod_1.z.record(zod_1.z.unknown()).optional(),
    notes: zod_1.z.string().optional(),
});
const updateLeadSchema = createLeadSchema.partial();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    const { page, limit, offset } = (0, response_1.parsePagination)(req.query);
    const { status, source, search, sort, order, score_min } = req.query;
    try {
        let query = supabase_1.supabaseAdmin
            .from('leads')
            .select('*', { count: 'exact' })
            .eq('org_id', req.user.orgId);
        if (status) {
            const statuses = status.split(',');
            query = query.in('status', statuses);
        }
        if (source) {
            query = query.eq('source', source);
        }
        if (score_min) {
            query = query.gte('score', parseInt(score_min, 10));
        }
        if (search) {
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,company.ilike.%${search}%`);
        }
        const sortField = sort || 'created_at';
        const sortOrder = order === 'asc';
        query = query.order(sortField, { ascending: sortOrder }).range(offset, offset + limit - 1);
        const { data, count, error } = await query;
        if (error) {
            (0, response_1.sendError)(res, 'DB_ERROR', error.message);
            return;
        }
        (0, response_1.sendSuccess)(res, data, 200, {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
        });
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to fetch leads', 500);
    }
});
router.post('/', (0, validate_1.validate)(createLeadSchema), async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('leads')
            .insert({
            id: (0, uuid_1.v4)(),
            org_id: req.user.orgId,
            ...req.body,
            status: 'new',
            score: 0,
        })
            .select()
            .single();
        if (error) {
            (0, response_1.sendError)(res, 'DB_ERROR', error.message);
            return;
        }
        await supabase_1.supabaseAdmin.from('lead_activities').insert({
            id: (0, uuid_1.v4)(),
            lead_id: data.id,
            org_id: req.user.orgId,
            type: 'status_change',
            description: 'Lead created',
            metadata: { source: req.body.source },
        });
        (0, response_1.sendSuccess)(res, data, 201);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to create lead', 500);
    }
});
router.post('/import', auth_1.authenticate, async (req, res) => {
    try {
        const { leads } = req.body;
        if (!Array.isArray(leads) || leads.length === 0) {
            (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'No leads provided');
            return;
        }
        const leadsToInsert = leads.map((lead) => ({
            id: (0, uuid_1.v4)(),
            org_id: req.user.orgId,
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
        const { data, error } = await supabase_1.supabaseAdmin
            .from('leads')
            .insert(leadsToInsert)
            .select();
        if (error) {
            (0, response_1.sendError)(res, 'DB_ERROR', error.message);
            return;
        }
        (0, response_1.sendSuccess)(res, {
            imported: data?.length || 0,
            total: leads.length,
        }, 201);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to import leads', 500);
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('leads')
            .select('*, lead_tags(*)')
            .eq('id', req.params.id)
            .eq('org_id', req.user.orgId)
            .single();
        if (error || !data) {
            (0, response_1.sendError)(res, 'NOT_FOUND', 'Lead not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, data);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to fetch lead', 500);
    }
});
router.put('/:id', (0, validate_1.validate)(updateLeadSchema), async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('leads')
            .update({ ...req.body, updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .eq('org_id', req.user.orgId)
            .select()
            .single();
        if (error) {
            (0, response_1.sendError)(res, 'DB_ERROR', error.message);
            return;
        }
        (0, response_1.sendSuccess)(res, data);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to update lead', 500);
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase_1.supabaseAdmin
            .from('leads')
            .delete()
            .eq('id', req.params.id)
            .eq('org_id', req.user.orgId);
        if (error) {
            (0, response_1.sendError)(res, 'DB_ERROR', error.message);
            return;
        }
        (0, response_1.sendSuccess)(res, { message: 'Lead deleted' });
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to delete lead', 500);
    }
});
router.get('/:id/activities', async (req, res) => {
    const { page, limit, offset } = (0, response_1.parsePagination)(req.query);
    try {
        const { data, count, error } = await supabase_1.supabaseAdmin
            .from('lead_activities')
            .select('*', { count: 'exact' })
            .eq('lead_id', req.params.id)
            .eq('org_id', req.user.orgId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error) {
            (0, response_1.sendError)(res, 'DB_ERROR', error.message);
            return;
        }
        (0, response_1.sendSuccess)(res, data, 200, {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
        });
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to fetch activities', 500);
    }
});
router.post('/:id/tags', async (req, res) => {
    const { tag } = req.body;
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('lead_tags')
            .insert({
            id: (0, uuid_1.v4)(),
            lead_id: req.params.id,
            tag,
        })
            .select()
            .single();
        if (error) {
            (0, response_1.sendError)(res, 'DB_ERROR', error.message);
            return;
        }
        (0, response_1.sendSuccess)(res, data, 201);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to add tag', 500);
    }
});
exports.default = router;
//# sourceMappingURL=leads.js.map