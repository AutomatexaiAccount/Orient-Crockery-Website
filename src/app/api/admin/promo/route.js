import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rppakudcmvwlkcxjhnfn.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_AUO4h2oUniw9oE4moZm3kw_HHjziI09";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Admin client uses service role key to bypass RLS (safe — we verify admin role below)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// Reusable admin auth verification (same pattern as coupons/orders routes)
async function verifyAdminSession(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;

  const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await supabaseAuthClient.auth.getUser(token);
  if (error || !user) return null;

  const clientToUse = supabaseServiceKey
    ? supabaseAdmin
    : createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } }
      });

  const { data: userData, error: roleError } = await clientToUse
    .from("users").select("role").eq("id", user.id).single();
  if (roleError || !userData || userData.role !== "admin") return null;

  return { user };
}

// GET /api/admin/promo — Read current promo config
export async function GET(request) {
  try {
    const adminSession = await verifyAdminSession(request);
    if (!adminSession) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("promo_config")
      .select("id, enabled, config_json")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("[PromoPopup] GET error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || null });
  } catch (err) {
    console.error("[PromoPopup] GET server error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST /api/admin/promo — Save promo config
export async function POST(request) {
  try {
    const adminSession = await verifyAdminSession(request);
    if (!adminSession) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const payload = await request.json();
    const {
      enabled,
      title,
      subtitle,
      couponCode,
      discountText,
      minOrderText,
      bannerTitle,
      bannerSubtitle,
      bannerImageUrl,
      delaySeconds,
      giftWrapFee,
    } = payload;

    // Build a clean config_json containing only popup display fields
    const config_json = {
      title: title ?? "",
      subtitle: subtitle ?? "",
      couponCode: couponCode ?? "",
      discountText: discountText ?? "",
      minOrderText: minOrderText ?? "",
      bannerTitle: bannerTitle ?? "",
      bannerSubtitle: bannerSubtitle ?? "",
      bannerImageUrl: bannerImageUrl ?? "",
      delaySeconds: typeof delaySeconds === "number" ? delaySeconds : 1.5,
      giftWrapFee: typeof giftWrapFee === "number" ? giftWrapFee : 50,
    };

    const upsertPayload = {
      id: 1,
      enabled: Boolean(enabled),
      config_json,
      updated_at: new Date().toISOString(),
    };

    console.log("[PromoPopup] Form payload:", JSON.stringify(payload));
    console.log("[PromoPopup] Database update:", JSON.stringify(upsertPayload));

    const { data, error } = await supabaseAdmin
      .from("promo_config")
      .upsert(upsertPayload, { onConflict: "id" })
      .select("id, enabled, config_json");

    if (error) {
      console.error("[PromoPopup] Supabase error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    console.log("[PromoPopup] Supabase response:", JSON.stringify(data));
    return NextResponse.json({ success: true, data: data?.[0] ?? null });
  } catch (err) {
    console.error("[PromoPopup] POST server error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
