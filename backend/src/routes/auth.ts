import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../config/supabase';
import { validate } from '../middleware/validate';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
  org_name: z.string().min(2),
  industry: z.enum([
    'real_estate', 'insurance', 'clinic', 'salon',
    'education', 'loans', 'other',
  ]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  const { email, password, full_name, org_name, industry } = req.body;

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (authError) {
      sendError(res, 'AUTH_ERROR', authError.message);
      return;
    }

    const userId = authData.user.id;
    const orgId = uuidv4();
    const slug = org_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { error: userError } = await supabaseAdmin.from('users').insert({
      id: userId,
      email,
      full_name,
    });

    if (userError) {
      sendError(res, 'DB_ERROR', userError.message);
      return;
    }

    const { error: orgError } = await supabaseAdmin.from('organizations').insert({
      id: orgId,
      name: org_name,
      slug: `${slug}-${orgId.slice(0, 8)}`,
      industry,
      plan: 'free',
      settings: {},
    });

    if (orgError) {
      sendError(res, 'DB_ERROR', orgError.message);
      return;
    }

    await supabaseAdmin.from('org_members').insert({
      id: uuidv4(),
      org_id: orgId,
      user_id: userId,
      role: 'owner',
    });

    const { data: session } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    sendSuccess(res, {
      user: { id: userId, email, full_name },
      organization: { id: orgId, name: org_name, slug },
      token: session?.session?.access_token,
    }, 201);
  } catch (err) {
    console.error('Registration error:', err);
    sendError(res, 'INTERNAL_ERROR', 'Registration failed', 500);
  }
});

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

    if (error) {
      sendError(res, 'AUTH_ERROR', 'Invalid email or password', 401);
      return;
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const { data: membership } = await supabaseAdmin
      .from('org_members')
      .select('org_id, role, organizations(id, name, slug, plan)')
      .eq('user_id', data.user.id)
      .single();

    sendSuccess(res, {
      user,
      organization: membership?.organizations,
      role: membership?.role,
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch (err) {
    console.error('Login error:', err);
    sendError(res, 'INTERNAL_ERROR', 'Login failed', 500);
  }
});

router.post('/logout', authenticate, async (_req: AuthenticatedRequest, res: Response) => {
  sendSuccess(res, { message: 'Logged out successfully' });
});

router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user!.id)
      .single();

    const { data: membership } = await supabaseAdmin
      .from('org_members')
      .select('org_id, role, organizations(id, name, slug, plan, industry, settings)')
      .eq('user_id', req.user!.id)
      .single();

    sendSuccess(res, {
      user,
      organization: membership?.organizations,
      role: membership?.role,
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    sendError(res, 'INTERNAL_ERROR', 'Failed to fetch profile', 500);
  }
});

router.put('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const { full_name, phone, avatar_url } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ full_name, phone, avatar_url, updated_at: new Date().toISOString() })
      .eq('id', req.user!.id)
      .select()
      .single();

    if (error) {
      sendError(res, 'DB_ERROR', error.message);
      return;
    }

    sendSuccess(res, data);
  } catch (err) {
    console.error('Profile update error:', err);
    sendError(res, 'INTERNAL_ERROR', 'Failed to update profile', 500);
  }
});

export default router;
