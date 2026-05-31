import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@/lib/supabase';

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({ from: jest.fn() })),
}));

describe('lib/supabase', () => {
  it('creates a browser client with the public env vars', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    const client = createClient();
    expect(client).toBeDefined();
    expect(createBrowserClient).toHaveBeenCalledWith('https://x.supabase.co', 'anon');
  });
});
