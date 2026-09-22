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
    const payload = await request.json();
    const { id, ...fields } = payload;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Coupon ID is required' }, { status: 400 });
    }

    // Sanitize the fields that may be edited
    const rawType = (fields.discount_type || 'PERCENTAGE').toString().toUpperCase().trim();
    const cleanType = rawType.includes('FIXED') ? 'FIXED' : 'PERCENTAGE';
    const isAdditive = fields.is_additive !== undefined
      ? Boolean(fields.is_additive)
      : rawType.includes('ADDITIVE');

    const updatePayload = {};

    if (fields.code !== undefined)
      updatePayload.code = fields.code.toString().toUpperCase().trim();
    if (fields.discount_type !== undefined)
      updatePayload.discount_type = cleanType;
    if (fields.discount_value !== undefined)
      updatePayload.discount_value = parseFloat(fields.discount_value) || 0;
    if (fields.min_cart_value !== undefined)
      updatePayload.min_cart_value = parseFloat(fields.min_cart_value) || 0;
    if (fields.is_active !== undefined)
      updatePayload.is_active = Boolean(fields.is_active);
    if (fields.is_additive !== undefined)
      updatePayload.is_additive = isAdditive;
    if (fields.valid_from !== undefined)
      updatePayload.valid_from = fields.valid_from || null;
    if (fields.valid_till !== undefined)
      updatePayload.valid_till = fields.valid_till || null;
    if (fields.max_discount !== undefined)
      updatePayload.max_discount = fields.max_discount ? parseFloat(fields.max_discount) : null;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ success: false, message: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await targetClient
      .from('coupons')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error editing coupon:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Server error editing coupon:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
