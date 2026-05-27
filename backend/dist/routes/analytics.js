"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/dashboard', async (req, res) => {
    try {
        const orgId = req.user.orgId;
        const [{ count: totalCalls }, { count: totalLeads }, { count: totalCampaigns }, { count: qualifiedLeads }, { count: appointmentsBooked },] = await Promise.all([
            supabase_1.supabaseAdmin.from('calls').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
            supabase_1.supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
            supabase_1.supabaseAdmin.from('campaigns').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
            supabase_1.supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('status', 'qualified'),
            supabase_1.supabaseAdmin.from('calls').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('appointment_booked', true),
        ]);
        const { data: recentCalls } = await supabase_1.supabaseAdmin
            .from('calls')
            .select('*, leads(first_name, last_name)')
            .eq('org_id', orgId)
            .order('created_at', { ascending: false })
            .limit(10);
        const { data: activeCampaigns } = await supabase_1.supabaseAdmin
            .from('campaigns')
            .select('id, name, status, total_leads, calls_made, calls_answered, leads_qualified')
            .eq('org_id', orgId)
            .eq('status', 'active')
            .limit(5);
        (0, response_1.sendSuccess)(res, {
            overview: {
                total_calls: totalCalls || 0,
                total_leads: totalLeads || 0,
                total_campaigns: totalCampaigns || 0,
                qualified_leads: qualifiedLeads || 0,
                appointments_booked: appointmentsBooked || 0,
                answer_rate: 0,
                qualification_rate: 0,
            },
            recent_calls: recentCalls || [],
            active_campaigns: activeCampaigns || [],
        });
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to fetch dashboard data', 500);
    }
});
router.get('/calls', async (req, res) => {
    const { period } = req.query;
    const orgId = req.user.orgId;
    try {
        const dateFilter = new Date();
        switch (period) {
            case '7d':
                dateFilter.setDate(dateFilter.getDate() - 7);
                break;
            case '30d':
                dateFilter.setDate(dateFilter.getDate() - 30);
                break;
            case '90d':
                dateFilter.setDate(dateFilter.getDate() - 90);
                break;
            default:
                dateFilter.setDate(dateFilter.getDate() - 30);
        }
        const { data: calls } = await supabase_1.supabaseAdmin
            .from('calls')
            .select('status, sentiment, duration_seconds, lead_qualified, appointment_booked, cost, created_at')
            .eq('org_id', orgId)
            .gte('created_at', dateFilter.toISOString());
        const stats = {
            total: calls?.length || 0,
            completed: calls?.filter(c => c.status === 'completed').length || 0,
            no_answer: calls?.filter(c => c.status === 'no_answer').length || 0,
            failed: calls?.filter(c => c.status === 'failed').length || 0,
            avg_duration: 0,
            total_cost: 0,
            sentiment_distribution: {
                positive: calls?.filter(c => c.sentiment === 'positive').length || 0,
                neutral: calls?.filter(c => c.sentiment === 'neutral').length || 0,
                negative: calls?.filter(c => c.sentiment === 'negative').length || 0,
            },
            qualified: calls?.filter(c => c.lead_qualified).length || 0,
            appointments: calls?.filter(c => c.appointment_booked).length || 0,
        };
        if (calls && calls.length > 0) {
            const totalDuration = calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);
            stats.avg_duration = Math.round(totalDuration / calls.length);
            stats.total_cost = calls.reduce((sum, c) => sum + (c.cost || 0), 0);
        }
        (0, response_1.sendSuccess)(res, stats);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to fetch call analytics', 500);
    }
});
router.get('/leads', async (req, res) => {
    const orgId = req.user.orgId;
    try {
        const { data: leads } = await supabase_1.supabaseAdmin
            .from('leads')
            .select('status, source, score')
            .eq('org_id', orgId);
        const stats = {
            total: leads?.length || 0,
            by_status: {
                new: leads?.filter(l => l.status === 'new').length || 0,
                contacted: leads?.filter(l => l.status === 'contacted').length || 0,
                qualified: leads?.filter(l => l.status === 'qualified').length || 0,
                unqualified: leads?.filter(l => l.status === 'unqualified').length || 0,
                converted: leads?.filter(l => l.status === 'converted').length || 0,
                lost: leads?.filter(l => l.status === 'lost').length || 0,
            },
            by_source: {
                manual: leads?.filter(l => l.source === 'manual').length || 0,
                csv_import: leads?.filter(l => l.source === 'csv_import').length || 0,
                api: leads?.filter(l => l.source === 'api').length || 0,
                webhook: leads?.filter(l => l.source === 'webhook').length || 0,
                whatsapp: leads?.filter(l => l.source === 'whatsapp').length || 0,
            },
            avg_score: 0,
        };
        if (leads && leads.length > 0) {
            stats.avg_score = Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length);
        }
        (0, response_1.sendSuccess)(res, stats);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to fetch lead analytics', 500);
    }
});
router.get('/campaigns', async (req, res) => {
    const orgId = req.user.orgId;
    try {
        const { data: campaigns } = await supabase_1.supabaseAdmin
            .from('campaigns')
            .select('id, name, status, type, total_leads, calls_made, calls_answered, leads_qualified, appointments_booked, created_at')
            .eq('org_id', orgId)
            .order('created_at', { ascending: false });
        const campaignStats = (campaigns || []).map(c => ({
            ...c,
            answer_rate: c.calls_made > 0 ? c.calls_answered / c.calls_made : 0,
            qualification_rate: c.calls_answered > 0 ? c.leads_qualified / c.calls_answered : 0,
            booking_rate: c.leads_qualified > 0 ? c.appointments_booked / c.leads_qualified : 0,
        }));
        (0, response_1.sendSuccess)(res, campaignStats);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to fetch campaign analytics', 500);
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map