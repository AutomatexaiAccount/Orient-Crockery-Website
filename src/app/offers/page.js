import React from "react";
import { createClient } from "@supabase/supabase-js";
import OffersList from "./OffersList";

export const metadata = {
  title: "Special Offers & Coupons | Orient Crockeries",
  description: "Browse the latest discount codes, offers, and coupons for premium dinnerware and hospitality solutions.",
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Keep it simple and server-rendered
export default async function OffersPage() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Fetch all active coupons
  const { data: coupons, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching coupons:", error);
  }

  return (
    <main className="offers-page" style={{ minHeight: "80vh", backgroundColor: "#f8fafc", paddingBottom: "60px" }}>
      {/* Hero Section */}
      <div style={{ backgroundColor: "#1a1a1a", padding: "clamp(25px, 5vw, 50px) 20px", textAlign: "center", borderBottom: "4px solid #d4af37" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", margin: "0 0 10px 0", color: "#d4af37" }}>
          Exclusive Offers & Coupons
        </h1>
        <p style={{ color: "#ffffff", maxWidth: "600px", margin: "0 auto", opacity: 0.9 }}>
          Apply these codes at checkout to get amazing discounts on your luxury dining collections.
        </p>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
        {(!coupons || coupons.length === 0) ? (
          <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <i className="fa-solid fa-ticket-simple" style={{ fontSize: "3rem", color: "#cbd5e1", marginBottom: "15px" }}></i>
            <h3>No active offers at the moment</h3>
            <p style={{ color: "#64748b" }}>Please check back later for new promotions and seasonal sales.</p>
          </div>
        ) : (
          <OffersList initialCoupons={coupons} />
        )}
      </div>
    </main>
  );
}
