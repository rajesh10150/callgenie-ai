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
const createCampaignSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    type: zod_1.z.enum(['cold_call', 'follow_up', 'appointment', 'survey']),
    language: zod_1.z.enum(['en', 'hi', 'kn', 'ta', 'te']).default('en'),
    ai_model: zod_1.z.enum(['gpt-4.1', 'claude', 'gemini', 'deepseek']).default('gpt-4.1'),
    voice_id: zod_1.z.string().optional(),
    caller_id: zod_1.z.string().optional(),
    schedule: zod_1.z.object({
        days: zod_1.z.array(zod_1.z.string()),
        start_time: zod_1.z.string(),
        end_time: zod_1.z.string(),
        timezone: zod_1.z.string(),
        max_concurrent_calls: zod_1.z.number().min(1).max(50).default(5),
    }).optional(),
    settings: zod_1.z.object({
        max_attempts: zod_1.z.number().min(1).max(10).default(3),
        retry_interval_hours: zod_1.z.number().min(1).default(24),
        voicemail_detection: zod_1.z.boolean().default(true),
        recording_enabled: zod_1.z.boolean().default(true),
    }).optional(),
    start_date: zod_1.z.string().optional(),
    end_date: zod_1.z.string().optional(),
});
const updateCampaignSchema = createCampaignSchema.partial();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    const { page, limit, offset } = (0, response_1.parsePagination)(req.query);
    const status = req.query.status;
    try {
        let query = supabase_1.supabaseAdmin
            .from('campaigns')
            .select('*', { count: 'exact' })
            .eq('org_id', req.user.orgId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (status) {
            query = query.eq('status', status);
        }
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
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to fetch campaigns', 500);
    }
});
router.post('/', (0, validate_1.validate)(createCampaignSchema), async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('campaigns')
            .insert({
            id: (0, uuid_1.v4)(),
            org_id: req.user.orgId,
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
            (0, response_1.sendError)(res, 'DB_ERROR', error.message);
            return;
        }
        (0, response_1.sendSuccess)(res, data, 201);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to create campaign', 500);
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('campaigns')
            .select('*, campaign_scripts(*)')
            .eq('id', req.params.id)
            .eq('org_id', req.user.orgId)
            .single();
        if (error || !data) {
            (0, response_1.sendError)(res, 'NOT_FOUND', 'Campaign not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, data);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to fetch campaign', 500);
    }
});
router.put('/:id', (0, validate_1.validate)(updateCampaignSchema), async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('campaigns')
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
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to update campaign', 500);
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase_1.supabaseAdmin
            .from('campaigns')
            .delete()
            .eq('id', req.params.id)
            .eq('org_id', req.user.orgId);
        if (error) {
            (0, response_1.sendError)(res, 'DB_ERROR', error.message);
            return;
        }
        (0, response_1.sendSuccess)(res, { message: 'Campaign deleted' });
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to delete campaign', 500);
    }
});
router.post('/:id/start', async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('campaigns')
            .update({ status: 'active', updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .eq('org_id', req.user.orgId)
            .in('status', ['draft', 'paused'])
            .select()
            .single();
        if (error || !data) {
            (0, response_1.sendError)(res, 'INVALID_STATE', 'Campaign cannot be started');
            return;
        }
        (0, response_1.sendSuccess)(res, data);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to start campaign', 500);
    }
});
router.post('/:id/pause', async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('campaigns')
            .update({ status: 'paused', updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .eq('org_id', req.user.orgId)
            .eq('status', 'active')
            .select()
            .single();
        if (error || !data) {
            (0, response_1.sendError)(res, 'INVALID_STATE', 'Campaign cannot be paused');
            return;
        }
        (0, response_1.sendSuccess)(res, data);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to pause campaign', 500);
    }
});
router.get('/:id/stats', async (req, res) => {
    try {
        const { data: campaign } = await supabase_1.supabaseAdmin
            .from('campaigns')
            .select('total_leads, calls_made, calls_answered, leads_qualified, appointments_booked')
            .eq('id', req.params.id)
            .eq('org_id', req.user.orgId)
            .single();
        if (!campaign) {
            (0, response_1.sendError)(res, 'NOT_FOUND', 'Campaign not found', 404);
            return;
        }
        const answerRate = campaign.calls_made > 0
            ? campaign.calls_answered / campaign.calls_made
            : 0;
        const qualificationRate = campaign.calls_answered > 0
            ? campaign.leads_qualified / campaign.calls_answered
            : 0;
        (0, response_1.sendSuccess)(res, {
            ...campaign,
            answer_rate: answerRate,
            qualification_rate: qualificationRate,
            progress: campaign.total_leads > 0
                ? campaign.calls_made / campaign.total_leads
                : 0,
        });
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to fetch stats', 500);
    }
});
exports.default = router;
//# sourceMappingURL=campaigns.js.map