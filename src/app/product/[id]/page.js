"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useApp } from "../../context/AppContext";
import { getImageStyle } from "../../utils/imageUtils";
import ProductImageZoomViewer from "../../components/ProductImageZoomViewer";
import ProductVideoEmbed from "../../components/ProductVideoEmbed";

const getValidImageUrl = (src) => {
  if (!src || typeof src !== 'string') return "/images/acacia_wood_casserole.png";
  const trimmed = src.trim();
  if (!trimmed) return "/images/acacia_wood_casserole.png";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return `/${trimmed}`;
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { products, addToCart, wishlist, toggleWishlist, isInWishlist } = useApp();
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id && products && products.length > 0) {
      const pId = parseInt(id, 10) || id;
      const product = products.find(p => p.id === pId);
      if (product) {
        setSelectedProduct(product);
      } else {
        router.replace("/catalog"); // not found
      }
    }
  }, [id, products, router]);

  const relatedProducts = useMemo(() => {
    if (!selectedProduct || !products.length) return [];
    
    let related = products.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id);
    
    if (related.length < 10) {
      const more = products.filter(p => p.department === selectedProduct.department && p.category !== selectedProduct.category && p.id !== selectedProduct.id);
      related = [...related, ...more];
    }
    
    if (related.length < 10) {
      const others = products.filter(p => p.department !== selectedProduct.department && p.id !== selectedProduct.id && (p.rating >= 4.5 || p.id % 2 === 0));
      related = [...related, ...others];
    }
    
    return related.slice(0, 5);
  }, [selectedProduct, products]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddToCart = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (addToCart(product, quantity)) {
      triggerToast(`Added ${quantity} ${product.name} to Cart`);
    }
  };

  const handleToggleWishlist = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggleWishlist(product)) {
      const inWish = wishlist.some(item => item.id === product.id);
      triggerToast(inWish ? `Removed ${product.name} from Wishlist` : `Saved ${product.name} to Wishlist`);
    }
  };

  const handleShare = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/product/${product.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Orient Crockeries!`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        triggerToast("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.handleProductShare = handleShare;
    }
  }, []);

  if (!selectedProduct) {
    return (
      <div className="container" style={{ marginTop: "100px", minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading Product...</p>
      </div>
    );
  }

  return (
    <main style={{ marginTop: "60px", paddingBottom: "40px" }}>
      <div className="container" style={{ paddingTop: "20px" }}>
        
        {/* Sleek Navigation */}
        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <button 
            type="button" 
            onClick={() => router.back()}
            style={{ 
              background: 'none', border: 'none', padding: '8px', cursor: 'pointer', 
              color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <i className="fa-solid fa-arrow-left" style={{ fontSize: '1.1rem' }}></i>
          </button>
          <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: '500', letterSpacing: '0.5px' }}>
            <Link href="/catalog" style={{ color: "#64748b", textDecoration: 'none' }}>Catalog</Link> 
            <span style={{ margin: '0 6px', color: '#cbd5e1' }}>/</span> 
            {selectedProduct.department}
            <span style={{ margin: '0 6px', color: '#cbd5e1' }}>/</span> 
            <span style={{ color: '#0f172a', fontWeight: '600' }}>{selectedProduct.category}</span>
          </span>
        </div>

        <div className="product-detail-layout" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", background: "var(--bg-surface)", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          
          <div className="modal-img-side" style={{ flex: "1 1 400px", maxWidth: "100%" }}>
            <ProductImageZoomViewer 
              product={selectedProduct} 
              activeImage={activeImage} 
              getValidImageUrl={getValidImageUrl} 
            />
            {selectedProduct.images && Array.isArray(selectedProduct.images) && selectedProduct.images.length > 1 && (
              <div className="thumbnail-gallery" style={{ display: 'flex', gap: '8px', padding: '12px', overflowX: 'auto', width: '100%', justifyContent: 'center' }}>
                {selectedProduct.images.map((img, idx) => (
                  <Image 
                    key={idx} 
                    src={getValidImageUrl(img)} 
                    alt={`${selectedProduct.name} - view ${idx + 1}`} 
                    width={55}
                    height={55}
                    className={`thumbnail ${(activeImage === img || (!activeImage && selectedProduct.image === img)) ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                    style={{ ...getImageStyle(selectedProduct, img, 'cover'), cursor: 'pointer', borderRadius: '6px' }}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="modal-content-side" style={{ flex: "1 1 400px", maxWidth: "100%" }}>
            <div className="modal-header" style={{ marginBottom: "1rem", borderBottom: "none", paddingBottom: 0 }}>
              <span className="modal-meta-label">
                <i className="fa-solid fa-gem" style={{ fontSize: "0.75rem", marginRight: "4px" }}></i>
                {selectedProduct.department}
              </span>
              <h1 className="modal-title" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{selectedProduct.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                <span className="product-price" style={{ fontSize: "1.5rem" }}>₹{selectedProduct.price.toFixed(2)}</span>
                {selectedProduct.mrp && selectedProduct.mrp !== selectedProduct.price && (
                  <span style={{ fontSize: "1.1rem", color: "#94a3b8", textDecoration: "line-through", fontWeight: "500" }}>
                    ₹{selectedProduct.mrp.toFixed(2)}
                  </span>
                )}
                {selectedProduct.stockStatus !== 'Out of Stock' && selectedProduct.stock > 0 && selectedProduct.stock <= 30 && (
                  <span style={{ color: '#d32f2f', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    🔥 Only {selectedProduct.stock} left
                  </span>
                )}
              </div>
              {/* Pack Size / Option */}
              <div style={{ marginTop: "1rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>Pack Size / Option</span>
                <div style={{ marginTop: "0.5rem", display: "flex", gap: "10px" }}>
                  <button style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "2px solid #10b981",
                    backgroundColor: "#ecfdf5",
                    color: "#047857",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}>1 BOX</button>
                </div>
              </div>

              {/* Cart Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "1.5rem", marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", height: "48px" }}>
                  <button 
                    style={{ width: "40px", height: "100%", background: "#fff", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#64748b" }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >-</button>
                  <span style={{ width: "40px", textAlign: "center", fontWeight: "600", fontSize: "1rem", color: "#0f172a" }}>{quantity}</span>
                  <button 
                    style={{ width: "40px", height: "100%", background: "#fff", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#64748b" }}
                    onClick={() => setQuantity(quantity + 1)}
                  >+</button>
                </div>
                <button 
                  style={{
                    flex: 1,
                    height: "48px",
                    background: "#0f172a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "1rem",
                    cursor: selectedProduct.stock <= 0 || selectedProduct.stockStatus === 'Out of Stock' ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    opacity: selectedProduct.stock <= 0 || selectedProduct.stockStatus === 'Out of Stock' ? 0.6 : 1
                  }}
                  onClick={(e) => handleAddToCart(selectedProduct, e)}
                  disabled={selectedProduct.stock <= 0 || selectedProduct.stockStatus === 'Out of Stock'}
                >
                  <i className="fa-solid fa-cart-shopping"></i>
                  <span>{(selectedProduct.stock <= 0 || selectedProduct.stockStatus === 'Out of Stock') ? "Out of Stock" : "Add to cart"}</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "2rem" }}>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 8px", textAlign: "center", backgroundColor: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <i className="fa-solid fa-truck-fast" style={{ fontSize: "1.2rem", color: "#0f172a", marginBottom: "8px" }}></i>
                  <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0f172a", lineHeight: "1.2" }}>Fast delivery</div>
                  <div style={{ fontSize: "0.65rem", color: "#64748b", marginTop: "4px" }}>Local hyper-fast</div>
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 8px", textAlign: "center", backgroundColor: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <i className="fa-solid fa-shield-halved" style={{ fontSize: "1.2rem", color: "#0f172a", marginBottom: "8px" }}></i>
                  <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0f172a", lineHeight: "1.2" }}>Orient Crockery</div>
                  <div style={{ fontSize: "0.65rem", color: "#64748b", marginTop: "4px" }}>Trusted product</div>
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 8px", textAlign: "center", backgroundColor: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <i className="fa-solid fa-location-dot" style={{ fontSize: "1.2rem", color: "#0f172a", marginBottom: "8px" }}></i>
                  <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0f172a", lineHeight: "1.2" }}>Near you</div>
                  <div style={{ fontSize: "0.65rem", color: "#64748b", marginTop: "4px" }}>Local dispatch</div>
                </div>
              </div>

              {/* Warranty Badge */}
              {selectedProduct.warranty && selectedProduct.warranty !== "No Warranty" && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "10px",
                  marginBottom: "1.5rem"
                }}>
                  <i className="fa-solid fa-shield-halved" style={{ color: "#16a34a", fontSize: "1.1rem", flexShrink: 0 }}></i>
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "#15803d", textTransform: "uppercase", letterSpacing: "0.5px" }}>Warranty</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: "600", color: "#14532d" }}>{selectedProduct.warranty}</div>
                  </div>
                </div>
              )}

              {/* About this product */}
              <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", backgroundColor: "#fff", overflow: "hidden", marginBottom: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                  <i className="fa-solid fa-circle-info" style={{ color: "#0f172a" }}></i>
                  <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "#0f172a" }}>About this product</span>
                </div>
                <div style={{ padding: "16px", fontSize: "0.9rem", color: "#475569", lineHeight: "1.6" }}>
                  {selectedProduct.description || "Indulging design and elite utility from Orient Crockeries, crafted to perfection."}
                </div>
              </div>
            </div>

            <ProductVideoEmbed product={selectedProduct} />

            {selectedProduct.reviews && selectedProduct.reviews.length > 0 && (
              <div style={{ marginTop: "1.5rem", borderTop: "1px solid #e2e8f0", paddingTop: "1.2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>Customer Reviews</h3>
                  <span style={{ backgroundColor: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "600" }}>
                    {selectedProduct.reviews.length} {selectedProduct.reviews.length === 1 ? 'Review' : 'Reviews'}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {selectedProduct.reviews.map((review, idx) => {
                    const initial = review.reviewerName ? review.reviewerName.charAt(0).toUpperCase() : "U";
                    const dateObj = review.timestamp ? new Date(review.timestamp) : new Date();
                    const dateStr = dateObj.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
                    return (
                      <div key={idx} style={{ paddingBottom: "12px", borderBottom: idx !== selectedProduct.reviews.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#e0e7ff", color: "#4338ca", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.85rem", flexShrink: 0 }}>
                            {initial}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: "600", fontSize: "0.88rem", color: "#334155" }}>{review.reviewerName}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                              <div style={{ fontSize: "0.8rem", display: "flex", letterSpacing: "1px" }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i} style={{ color: i < review.rating ? "#f59e0b" : "#e2e8f0" }}>★</span>
                                ))}
                              </div>
                              <span style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: "500" }}>{dateStr}</span>
                            </div>
                          </div>
                        </div>
                        <p style={{ fontSize: "0.85rem", color: "#475569", margin: "4px 0 0 0", lineHeight: "1.4", paddingLeft: "44px" }}>
                          {review.comment}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section" style={{ marginTop: "3rem" }}>
            <h3 className="related-products-title" style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>You May Also Like</h3>
            <div className="premium-related-products-row">
              {relatedProducts.map(rp => {
                const inWish = isInWishlist(rp.id);
                return (
                  <div 
                    key={rp.id} 
                    className="product-card" 
                    onClick={() => router.push(`/product/${rp.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="product-img-wrapper">
                      {(rp.stock <= 0 || rp.stockStatus === 'Out of Stock') && <span className="product-badge out-stock">Out of Stock</span>}
                      {rp.rating >= 4.9 && rp.stock > 30 && rp.stockStatus !== 'Out of Stock' && <span className="product-badge">Premium Selection</span>}
                      <Image 
                        src={getValidImageUrl(rp.image)} 
                        alt={rp.name} 
                        fill 
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="product-image" 
                        style={getImageStyle(rp, rp.image, 'cover')}
                      />
                      <button 
                        className={`wishlist-btn ${inWish ? "active" : ""}`}
                        onClick={(e) => handleToggleWishlist(rp, e)}
                        aria-label="Toggle Wishlist"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={inWish ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                      <button 
                        className="share-btn"
                        onClick={(e) => handleShare(rp, e)}
                        aria-label="Share Product"
                      >
                        <i className="fa-solid fa-share-nodes"></i>
                      </button>
                    </div>
                    <div className="product-info" style={{ padding: "16px" }}>
                      <div className="product-meta" style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span className="product-category" style={{ fontSize: "0.75rem", color: "#0ea5e9", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>{rp.department || rp.category}</span>
                        <div className="product-rating" style={{ fontSize: "0.8rem", fontWeight: "600", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                          <i className="fa-solid fa-star" style={{ color: "#f59e0b" }}></i>
                          <span>{rp.rating ? rp.rating.toFixed(1) : "4.0"}</span>
                        </div>
                      </div>
                      <h3 className="product-title" style={{ fontSize: "1rem", fontWeight: "600", color: "#1e293b", margin: "0 0 12px 0", lineHeight: "1.4" }}>{rp.name}</h3>
                      <div className="product-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div className="product-price" style={{ fontSize: "1.2rem", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                          ₹{rp.price.toFixed(2)}
                          {rp.mrp && rp.mrp !== rp.price && (
                            <span style={{ fontSize: "0.85rem", color: "#94a3b8", textDecoration: "line-through", fontWeight: "500" }}>₹{rp.mrp.toFixed(2)}</span>
                          )}
                        </div>
                        <button 
                          className="btn-add-to-cart"
                          onClick={(e) => handleAddToCart(rp, e)}
                          disabled={rp.stock <= 0 || rp.stockStatus === 'Out of Stock'}
                          aria-label={`Add ${rp.name} to cart`}
                        >
                          <i className="fa-solid fa-cart-shopping"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <div className={`toast toast-success ${showToast ? "show" : ""}`}>
        <i className="fa-solid fa-circle-check" style={{ color: "var(--primary)", fontSize: "1.1rem" }}></i>
        <span>{toastMessage}</span>
      </div>
    </main>
  );
}
