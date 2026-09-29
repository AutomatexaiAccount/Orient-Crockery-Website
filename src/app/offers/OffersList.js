"use client";

import React, { useState } from "react";

export default function OffersList({ initialCoupons }) {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getDiscountText = (coupon) => {
    if (coupon.discount_type && coupon.discount_type.includes("PERCENTAGE")) {
      return `${coupon.discount_value}% OFF`;
    }
    return `---${coupon.discount_value} OFF`;
  };

  return (
    <>
      <style>{`
        .coupon-ticket {
          display: flex;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid #e2e8f0;
        }
        .coupon-ticket:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .ticket-left {
          background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
          color: #d4af37;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 160px;
          position: relative;
          border-right: 2px dashed #4a5568;
        }
        .ticket-left::before, .ticket-left::after {
          content: '';
          position: absolute;
          right: -10px;
          width: 20px;
          height: 20px;
          background-color: #f8fafc;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          z-index: 1;
        }
        .ticket-left::before {
          top: -11px;
          border-bottom: none;
        }
        .ticket-left::after {
          bottom: -11px;
          border-top: none;
        }
        .ticket-right {
          padding: 25px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #ffffff;
        }
        .ticket-badge {
          display: inline-block;
          background: #fef3c7;
          color: #b45309;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          padding: 4px 10px;
          border-radius: 20px;
          margin-bottom: 12px;
        }
        .copy-btn {
          background: #d4af37;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px -1px rgba(212, 175, 55, 0.3);
        }
        .copy-btn:hover {
          background: #c5a028;
          transform: translateY(-1px);
          box-shadow: 0 6px 8px -1px rgba(212, 175, 55, 0.4);
        }
        .copy-btn.copied {
          background: #10b981;
          box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
        }
        .promo-code-box {
          background: #f8fafc;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 2px;
          border: 2px dashed #cbd5e1;
          display: flex;
          align-items: center;
        }
        @media (max-width: 640px) {
          .coupon-ticket {
            flex-direction: column;
          }
          .ticket-left {
            width: 100%;
            border-right: none;
            border-bottom: 2px dashed #4a5568;
            padding: 20px;
          }
          .ticket-left::before, .ticket-left::after {
            display: none;
          }
          .ticket-right {
            padding: 20px;
          }
          .promo-action-row {
            flex-direction: column;
            align-items: stretch !important;
          }
          .promo-code-box {
            justify-content: center;
            margin-bottom: 10px;
          }
          .copy-btn {
            justify-content: center;
          }
        }
      `}</style>
      <div style={{ display: "grid", gap: "25px", maxWidth: "800px", margin: "0 auto" }}>
        {initialCoupons.map((coupon) => (
          <div key={coupon.id} className="coupon-ticket">
            {/* Left Side - Discount Amount */}
            <div className="ticket-left">
              <h2 style={{ fontSize: "2.5rem", fontWeight: "900", margin: "0", lineHeight: "1", textAlign: "center", textShadow: "0 2px 4px rgba(0,0,0,0.3)", color: "#d4af37" }}>
                {getDiscountText(coupon).split(' ')[0]}
              </h2>
              <span style={{ fontSize: "1rem", fontWeight: "700", letterSpacing: "2px", opacity: 0.9, marginTop: "5px", color: "#d4af37" }}>
                {getDiscountText(coupon).split(' ')[1]}
              </span>
            </div>

            {/* Right Side - Details and Copy */}
            <div className="ticket-right">
              <div>
                <div className="ticket-badge">
                  {coupon.is_additive ? "Stackable" : "Exclusive"} Offer
                </div>
                <h3 style={{ fontSize: "1.25rem", margin: "0 0 8px 0", color: "#1e293b", fontFamily: "var(--font-serif)" }}>
                  Special Discount on Luxury Dining
                </h3>
                <p style={{ fontSize: "0.95rem", color: "#64748b", margin: "0 0 20px 0", lineHeight: "1.5" }}>
                  {coupon.min_cart_value > 0 
                    ? `Valid on all premium orders above ---${coupon.min_cart_value}. ` 
                    : "Valid on all premium orders. "}
                  {coupon.valid_till && `Offer expires on ${new Date(coupon.valid_till).toLocaleDateString()}.`}
                </p>
              </div>
              
              <div className="promo-action-row" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div className="promo-code-box">
                  {coupon.code}
                </div>
                <button 
                  onClick={() => handleCopy(coupon.code)}
                  className={`copy-btn ${copiedCode === coupon.code ? 'copied' : ''}`}
                >
                  {copiedCode === coupon.code ? (
                    <><i className="fa-solid fa-check"></i> Code Copied!</>
                  ) : (
                    <><i className="fa-regular fa-copy"></i> Copy Code</>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
