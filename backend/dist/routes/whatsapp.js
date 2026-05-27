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
const createTemplateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    language: zod_1.z.enum(['en', 'hi', 'kn', 'ta', 'te']),
    content: zod_1.z.string().min(1),
    type: zod_1.z.enum(['follow_up', 'appointment_confirmation', 'reminder']),
});
router.use(auth_1.authenticate);
router.get('/templates', async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('whatsapp_templates')
            .select('*')
            .eq('org_id', req.user.orgId)
            .order('created_at', { ascending: false });
        if (error) {
            (0, response_1.sendError)(res, 'DB_ERROR', error.message);
            return;
        }
        (0, response_1.sendSuccess)(res, data || []);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to fetch templates', 500);
    }
});
router.post('/templates', (0, validate_1.validate)(createTemplateSchema), async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('whatsapp_templates')
            .insert({
            id: (0, uuid_1.v4)(),
            org_id: req.user.orgId,
            ...req.body,
            is_active: true,
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
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to create template', 500);
    }
});
router.put('/templates/:id', async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('whatsapp_templates')
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
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to update template', 500);
    }
});
router.post('/send', async (req, res) => {
    const { lead_id, template_id } = req.body;
    try {
        const { data: lead } = await supabase_1.supabaseAdmin
            .from('leads')
            .select('phone, first_name')
            .eq('id', lead_id)
            .eq('org_id', req.user.orgId)
            .single();
        if (!lead) {
            (0, response_1.sendError)(res, 'NOT_FOUND', 'Lead not found', 404);
            return;
        }
        const { data: template } = await supabase_1.supabaseAdmin
            .from('whatsapp_templates')
            .select('*')
            .eq('id', template_id)
            .eq('org_id', req.user.orgId)
            .single();
        if (!template) {
            (0, response_1.sendError)(res, 'NOT_FOUND', 'Template not found', 404);
            return;
        }
        // In production, this would send via WhatsApp Business API / Twilio
        (0, response_1.sendSuccess)(res, {
            message: 'WhatsApp message queued',
            to: lead.phone,
            template: template.name,
        }, 202);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to send message', 500);
    }
});
exports.default = router;
//# sourceMappingURL=whatsapp.js.map