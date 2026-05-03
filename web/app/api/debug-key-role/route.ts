import { NextResponse } from 'next/server';

// Decodes the JWT payload of the service role key WITHOUT exposing the key itself.
// Returns just the role claim — confirms whether Vercel has anon vs service_role.
export async function GET() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return NextResponse.json({ error: 'env var missing' }, { status: 500 });
  try {
    const parts = key.split('.');
    if (parts.length !== 3) return NextResponse.json({ role: 'unknown', shape: 'not-jwt' });
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return NextResponse.json({
      role: payload.role,
      iss: payload.iss,
      ref: payload.ref,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
