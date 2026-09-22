import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rppakudcmvwlkcxjhnfn.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_AUO4h2oUniw9oE4moZm3kw_HHjziI09';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

async function verifyAdminSession(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await supabaseAuthClient.auth.getUser(token);
  if (error || !user) return null;

  const clientToUse = supabaseServiceKey ? supabaseAdmin : createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: userData, error: roleError } = await clientToUse
    .from('users').select('role').eq('id', user.id).single();
  if (roleError || !userData || userData.role !== 'admin') return null;

  return { user, client: clientToUse };
}

export async function POST(request) {
  try {
    const adminSession = await verifyAdminSession(request);
    if (!adminSession) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const targetClient = adminSession.client;
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'Coupon ID is required' }, { status: 400 });
    }

    // Attempt deletion. If the orders table has a FK reference to coupon_id,
    // Supabase will return a foreign key constraint error. In that case we
    // deactivate instead of hard-deleting, so historical order data is preserved.
    const { error } = await targetClient
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      // Foreign key constraint: orders reference this coupon — deactivate instead
      if (error.message.includes('foreign key') || error.message.includes('violates') || error.code === '23503') {
        const { error: deactivateErr } = await targetClient
          .from('coupons')
          .update({ is_active: false })
          .eq('id', id);

        if (deactivateErr) {
          console.error('Error deactivating coupon as fallback:', deactivateErr);
          return NextResponse.json({ success: false, message: deactivateErr.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          deactivated: true,
          message: 'Coupon is referenced by existing orders and cannot be hard-deleted. It has been permanently deactivated instead.'
        });
      }

      console.error('Error deleting coupon:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: true, message: 'Coupon deleted successfully.' });
  } catch (err) {
    console.error('Server error deleting coupon:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
