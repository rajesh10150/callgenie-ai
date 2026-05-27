"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const supabase_1 = require("../config/supabase");
const validate_1 = require("../middleware/validate");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    full_name: zod_1.z.string().min(2),
    org_name: zod_1.z.string().min(2),
    industry: zod_1.z.enum([
        'real_estate', 'insurance', 'clinic', 'salon',
        'education', 'loans', 'other',
    ]),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
router.post('/register', (0, validate_1.validate)(registerSchema), async (req, res) => {
    const { email, password, full_name, org_name, industry } = req.body;
    try {
        const { data: authData, error: authError } = await supabase_1.supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name },
        });
        if (authError) {
            (0, response_1.sendError)(res, 'AUTH_ERROR', authError.message);
            return;
        }
        const userId = authData.user.id;
        const orgId = (0, uuid_1.v4)();
        const slug = org_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const { error: userError } = await supabase_1.supabaseAdmin.from('users').insert({
            id: userId,
            email,
            full_name,
        });
        if (userError) {
            (0, response_1.sendError)(res, 'DB_ERROR', userError.message);
            return;
        }
        const { error: orgError } = await supabase_1.supabaseAdmin.from('organizations').insert({
            id: orgId,
            name: org_name,
            slug: `${slug}-${orgId.slice(0, 8)}`,
            industry,
            plan: 'free',
            settings: {},
        });
        if (orgError) {
            (0, response_1.sendError)(res, 'DB_ERROR', orgError.message);
            return;
        }
        await supabase_1.supabaseAdmin.from('org_members').insert({
            id: (0, uuid_1.v4)(),
            org_id: orgId,
            user_id: userId,
            role: 'owner',
        });
        const { data: session } = await supabase_1.supabaseAdmin.auth.signInWithPassword({
            email,
            password,
        });
        (0, response_1.sendSuccess)(res, {
            user: { id: userId, email, full_name },
            organization: { id: orgId, name: org_name, slug },
            token: session?.session?.access_token,
        }, 201);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Registration failed', 500);
    }
});
router.post('/login', (0, validate_1.validate)(loginSchema), async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data, error } = await supabase_1.supabaseAdmin.auth.signInWithPassword({ email, password });
        if (error) {
            (0, response_1.sendError)(res, 'AUTH_ERROR', 'Invalid email or password', 401);
            return;
        }
        const { data: user } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
        const { data: membership } = await supabase_1.supabaseAdmin
            .from('org_members')
            .select('org_id, role, organizations(id, name, slug, plan)')
            .eq('user_id', data.user.id)
            .single();
        (0, response_1.sendSuccess)(res, {
            user,
            organization: membership?.organizations,
            role: membership?.role,
            token: data.session.access_token,
            refresh_token: data.session.refresh_token,
        });
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Login failed', 500);
    }
});
router.post('/logout', auth_1.authenticate, async (_req, res) => {
    (0, response_1.sendSuccess)(res, { message: 'Logged out successfully' });
});
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const { data: user } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();
        const { data: membership } = await supabase_1.supabaseAdmin
            .from('org_members')
            .select('org_id, role, organizations(id, name, slug, plan, industry, settings)')
            .eq('user_id', req.user.id)
            .single();
        (0, response_1.sendSuccess)(res, {
            user,
            organization: membership?.organizations,
            role: membership?.role,
        });
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to fetch profile', 500);
    }
});
router.put('/me', auth_1.authenticate, async (req, res) => {
    const { full_name, phone, avatar_url } = req.body;
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('users')
            .update({ full_name, phone, avatar_url, updated_at: new Date().toISOString() })
            .eq('id', req.user.id)
            .select()
            .single();
        if (error) {
            (0, response_1.sendError)(res, 'DB_ERROR', error.message);
            return;
        }
        (0, response_1.sendSuccess)(res, data);
    }
    catch {
        (0, response_1.sendError)(res, 'INTERNAL_ERROR', 'Failed to update profile', 500);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map