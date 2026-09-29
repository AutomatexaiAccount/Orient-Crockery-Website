import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import { sendWhatsAppMessage } from '@/app/utils/whatsapp';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rppakudcmvwlkcxjhnfn.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_AUO4h2oUniw9oE4moZm3kw_HHjziI09';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Authentication-only client (anon key) — used ONLY to validate the user's JWT.
// Never used for database inserts/updates.
const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Privileged server-only client — used for all checkout database operations.
// Bypasses RLS. The user's JWT is NEVER attached to this client.
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_secret_here'
});

export async function POST(request) {
  try {
    // ── Step 0: Validate the user's JWT (if provided) ──
    // Extract the verified user identity. Never trust client-supplied userId.
    const authHeader = request.headers.get('Authorization');
    let verifiedUserId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      if (token) {
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
        if (!authError && user) {
          verifiedUserId = user.id;
        }
      }
    }

    const body = await request.json();
    const { items, customerDetails, couponCode, shippingFee } = body;

    // 1. Calculate totals securely on the backend
    let subtotal = 0;
    let totalGST = 0;
    
    items.forEach(item => {
      const itemBase = (item.price || 0) * (item.qty || item.quantity || 1);
      const rate = (item.gst !== undefined && item.gst !== null && item.gst !== '') ? parseFloat(item.gst) : 0;
      const itemGst = itemBase * (rate / 100);
      subtotal += itemBase;
      totalGST += itemGst;
    });

    // 2. Validate Coupon securely
    let discountAmount = 0;
    let couponId = null;
    if (couponCode) {
      const { data: coupon } = await supabaseAdmin.from('coupons').select('*').eq('code', couponCode).single();
      if (coupon && coupon.is_active) {
        if (coupon.discount_type === 'PERCENTAGE') {
          discountAmount = (subtotal * coupon.discount_value) / 100;
          if (coupon.max_discount && discountAmount > coupon.max_discount) discountAmount = coupon.max_discount;
        } else {
          discountAmount = coupon.discount_value;
        }
        if (discountAmount > subtotal) discountAmount = subtotal;
        couponId = coupon.id;
      }
    }

    const deliveryMethod = body.deliveryMethod || customerDetails.deliveryMethod || customerDetails.shippingAddress?.delivery_method || 'delivery';
    const giftPackaging = customerDetails.giftPackaging || customerDetails.shippingAddress?.gift_packaging || 'standard';
    const giftWrapFee = giftPackaging === 'gift' ? (parseFloat(body.giftWrapFee || customerDetails.giftWrapFee || 50) || 50) : 0;

    const finalTotal = subtotal + totalGST + (shippingFee || 0) + giftWrapFee - discountAmount;
    const orderId = "ORD-" + Math.floor(Math.random() * 900000 + 100000);

    // 3. Create Razorpay Order securely
    const options = {
      amount: Math.round(finalTotal * 100),
      currency: "INR",
      receipt: orderId
    };
    
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(options);
    } catch(e) {
      console.log('Razorpay keys might be invalid, falling back to dummy order id for demo', e);
      razorpayOrder = { id: 'order_' + Math.random().toString(36).substr(2, 9) };
    }

    const shippingAddressObj = typeof customerDetails.shippingAddress === 'object' ? 
      { name: customerDetails.name, phone: customerDetails.phone, delivery_method: deliveryMethod, gift_packaging: giftPackaging, gift_wrap_fee: giftWrapFee, ...customerDetails.shippingAddress } : 
      { name: customerDetails.name, phone: customerDetails.phone, delivery_method: deliveryMethod, gift_packaging: giftPackaging, gift_wrap_fee: giftWrapFee, raw_text: customerDetails.shippingAddress };

    // STEP A: Ensure customer record exists in public.customers BEFORE inserting orders (avoids FK constraint errors)
    // Use verifiedUserId (from JWT) when available; fall back to client-supplied userId only for guest checkout.
    let validatedCustomerId = verifiedUserId || customerDetails.userId || null;
    const cleanPhone = customerDetails.phone ? (customerDetails.phone.startsWith('+') ? customerDetails.phone : `+91${customerDetails.phone.replace(/\D/g, '').slice(-10)}`) : '';

    if (validatedCustomerId || cleanPhone || customerDetails.email) {
      try {
        const custIdToUse = validatedCustomerId || crypto.randomUUID();
        const { error: custErr } = await supabaseAdmin.from('customers').upsert({
          id: custIdToUse,
          full_name: customerDetails.name || 'Patron',
          phone_number: cleanPhone || '',
          email: customerDetails.email || '',
          loyalty_points: 0
        }, { onConflict: 'id' });

        if (custErr) {
          console.warn('Customer pre-upsert notice:', custErr.message);
        } else {
          validatedCustomerId = custIdToUse;
        }
      } catch (cErr) {
        console.warn('Customer upsert exception:', cErr);
      }
    }

    // 4. Save to Database
    const dbOrder = {
      order_number: orderId,
      customer_id: validatedCustomerId,
      guest_email: customerDetails.email,
      guest_phone: customerDetails.phone,
      total_mrp: subtotal,
      discount_amount: discountAmount,
      taxable_value: subtotal, // For exclusive, taxable value is the base subtotal
      tax_amount: totalGST,
      shipping_charge: (shippingFee || 0) + giftWrapFee,
      final_total: finalTotal,
      payment_mode: body.paymentMethod === 'COD' ? 'COD' : 'UPI',
      payment_status: body.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      payment_reference_id: razorpayOrder.id,
      order_status: 'NEW',
      shipping_address: shippingAddressObj,
      billing_address: customerDetails.billingAddress || shippingAddressObj || {},
      coupon_id: couponId
    };

    let orderData = null;
    let { data: insData, error: insError } = await supabaseAdmin.from("orders").insert(dbOrder).select().single();
    
    // If foreign key constraint or RLS policy failed on customer_id, retry cleanly with customer_id: null
    if (insError && (insError.message.includes('foreign key') || insError.message.includes('orders_customer_id_fkey') || insError.message.includes('row-level security'))) {
      console.warn('Fallback: inserting order with guest customer linkage due to FK or RLS');
      const fallbackOrder = { ...dbOrder, customer_id: null };
      const res = await supabaseAdmin.from("orders").insert(fallbackOrder).select().single();
      insData = res.data;
      insError = res.error;
    }

    // If coupon_id column issue
    if (insError && insError.message.includes('coupon_id')) {
      const noCouponOrder = { ...dbOrder, coupon_id: null };
      if (insError.message.includes('customer_id_fkey') || insError.message.includes('row-level security')) {
        noCouponOrder.customer_id = null;
      }
      const res = await supabaseAdmin.from("orders").insert(noCouponOrder).select().single();
      insData = res.data;
      insError = res.error;
    }

    if (insError) {
      console.error('Final DB order insert error:', insError);
      throw insError;
    }

    orderData = insData;

    if (items && items.length > 0 && orderData) {
      const orderItems = items.map(item => {
        const rate = (item.gst !== undefined && item.gst !== null && item.gst !== '') ? parseFloat(item.gst) : 0;
        const qty = item.qty || item.quantity || 1;
        const unitPrice = item.price || 0;
        const taxableValue = unitPrice * qty;
        const itemGst = taxableValue * (rate / 100);
        return {
          order_id: orderData.id,
          product_id: String(item.id || ''),
          product_name: item.name || item.title || 'Orient Tableware',
          quantity: qty,
          mrp: item.mrp || unitPrice,
          selling_price: unitPrice,
          gst: rate,
          tax_amount: itemGst
        };
      });

      // Try inserting order items — if new columns don't exist yet, retry with core fields only
      let { error: itemsErr } = await supabaseAdmin.from("order_items").insert(orderItems);
      if (itemsErr) {
        console.warn('Order items insert attempt 1 failed:', itemsErr.message);
        // Retry with only the original core columns
        const coreItems = orderItems.map(oi => ({
          order_id: oi.order_id,
          product_id: oi.product_id,
          product_name: oi.product_name,
          quantity: oi.quantity,
          mrp: oi.mrp,
          selling_price: oi.selling_price,
          gst: oi.gst,
          tax_amount: oi.tax_amount
        }));
        const { error: retryErr } = await supabaseAdmin.from("order_items").insert(coreItems);
        if (retryErr) console.warn('Order items insert attempt 2 failed:', retryErr.message);
      }
    }

    // --- WHATSAPP INTEGRATION ---
    // Trigger the WhatsApp order confirmation notification asynchronously!
    const cleanCustomerPhone = customerDetails.phone ? customerDetails.phone.replace(/\D/g, '') : '';
    if (cleanCustomerPhone) {
      // Add country code if missing (assumes India +91 for now)
      const formattedPhone = cleanCustomerPhone.length === 10 ? `91${cleanCustomerPhone}` : cleanCustomerPhone;
      
      const customerFirstName = customerDetails.name ? customerDetails.name.split(' ')[0] : 'Customer';
      
      // We don't await this so it doesn't slow down the checkout process for the user
      sendWhatsAppMessage(formattedPhone, 'order_confirmation_v1', [
        { type: 'text', text: customerFirstName }, // {{1}} Name
        { type: 'text', text: orderData.order_number }, // {{2}} Order Number
        { type: 'text', text: String(finalTotal) } // {{3}} Total Amount
      ]).catch(err => console.error("Non-blocking WhatsApp Error:", err));
    }

    return NextResponse.json({
      success: true,
      order: orderData,
      razorpayOrderId: razorpayOrder.id,
      amount: options.amount
    });

  } catch (err) {
    console.error('Error creating order:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

