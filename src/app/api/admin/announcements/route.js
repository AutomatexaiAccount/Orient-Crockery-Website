import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from("promo_config")
      .select("enabled, config_json")
      .eq("id", 2)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || { enabled: false, config_json: { announcements: [] } } });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const { enabled, announcements } = payload;

    const upsertPayload = {
      id: 2,
      enabled: Boolean(enabled),
      config_json: { announcements: announcements || [] },
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("promo_config")
      .upsert(upsertPayload, { onConflict: "id" })
      .select("enabled, config_json");

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data?.[0] ?? null });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
