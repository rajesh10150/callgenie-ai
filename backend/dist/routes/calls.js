"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    const { page, limit, offset } = (0, response_1.parsePagination)(req.query);
    const { campaign_id, status, sentiment, lead_qualified, date_from, date_to } = req.query;
    try {
        let query = supabase_1.supabaseAdmin
            .from('calls')
            .select('*, leads(first_name, last_name, phone, company), campaigns(name)', { count: 'exact' })
            .eq('org_id', req.user.orgId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (campaign_id)
            query = query.eq('campaign_id', campaign_id);
        if (status)
            query = query.eq('status', status);
        if (sentiment)
            query = query.eq('sentiment', sentiment);
        if (lead_qualified)
            query = query.eq('lead_qualified', lead_qualified === 'true');
        if (date_from)
            query = query.gte('created_at', date_from);
        if (date_to)
            query = query.lte('created_at', date_to);
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
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to fetch calls', 500);
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('calls')
            .select('*, leads(*), campaigns(name), call_transcripts(*)')
            .eq('id', req.params.id)
            .eq('org_id', req.user.orgId)
            .single();
        if (error || !data) {
            (0, response_1.sendError)(res, 'NOT_FOUND', 'Call not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, data);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to fetch call', 500);
    }
});
router.get('/:id/transcript', async (req, res) => {
    try {
        const { data: call } = await supabase_1.supabaseAdmin
            .from('calls')
            .select('id')
            .eq('id', req.params.id)
            .eq('org_id', req.user.orgId)
            .single();
        if (!call) {
            (0, response_1.sendError)(res, 'NOT_FOUND', 'Call not found', 404);
            return;
        }
        const { data, error } = await supabase_1.supabaseAdmin
            .from('call_transcripts')
            .select('*')
            .eq('call_id', req.params.id)
            .single();
        if (error) {
            (0, response_1.sendError)(res, 'NOT_FOUND', 'Transcript not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, data);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to fetch transcript', 500);
    }
});
router.post('/initiate', async (req, res) => {
    const { lead_id, campaign_id } = req.body;
    try {
        const { data: lead } = await supabase_1.supabaseAdmin
            .from('leads')
            .select('*')
            .eq('id', lead_id)
            .eq('org_id', req.user.orgId)
            .single();
        if (!lead) {
            (0, response_1.sendError)(res, 'NOT_FOUND', 'Lead not found', 404);
            return;
        }
        const { data: campaign } = await supabase_1.supabaseAdmin
            .from('campaigns')
            .select('*')
            .eq('id', campaign_id)
            .eq('org_id', req.user.orgId)
            .single();
        if (!campaign) {
            (0, response_1.sendError)(res, 'NOT_FOUND', 'Campaign not found', 404);
            return;
        }
        // In production, this would trigger the Twilio call via the voice service
        (0, response_1.sendSuccess)(res, {
            message: 'Call initiated',
            call_id: 'pending',
            lead_id,
            campaign_id,
            status: 'queued',
        }, 202);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to initiate call', 500);
    }
});
exports.default = router;
//# sourceMappingURL=calls.js.map