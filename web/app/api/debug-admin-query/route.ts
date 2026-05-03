import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Tests the admin-client profile query without needing a session.
export async function GET() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data, error } = await admin
    .from('profiles')
    .select('id, email, role, status')
    .eq('email', 'bakhchanemouad@gmail.com')
    .maybeSingle();

  return NextResponse.json({
    found: !!data,
    role: data?.role ?? null,
    status: data?.status ?? null,
    error: error?.message ?? null,
    code: error?.code ?? null,
  });
}
