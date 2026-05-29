import { createClient, SupabaseClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { config } from './index';

const realtimeOptions = {
  realtime: {
    params: { eventsPerSecond: 0 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transport: WebSocket as any,
  },
};

let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    if (!config.supabase.url || !config.supabase.serviceRoleKey) {
      throw new Error(
        'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
      );
    }
    _supabaseAdmin = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        ...realtimeOptions,
      }
    );
  }
  return _supabaseAdmin;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const admin = getSupabaseAdmin();
    const value = (admin as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? value.bind(admin) : value;
  },
});

let _supabaseAnon: SupabaseClient | null = null;

export function getSupabaseAnon(): SupabaseClient {
  if (!_supabaseAnon) {
    if (!config.supabase.url || !config.supabase.anonKey) {
      throw new Error(
        'Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.'
      );
    }
    _supabaseAnon = createClient(config.supabase.url, config.supabase.anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      ...realtimeOptions,
    });
  }
  return _supabaseAnon;
}

export const createSupabaseClient = (accessToken: string) => {
  if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.'
    );
  }
  return createClient(config.supabase.url, config.supabase.anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    ...realtimeOptions,
  });
};
