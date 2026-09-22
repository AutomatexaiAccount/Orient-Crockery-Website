"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

// ── Shared admin session helper (mirrors pattern in API routes) ──────────────
async function getAdminAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// ── Initial form state ────────────────────────────────────────────────────────
const EMPTY_FORM = {
  code: "",
  discount_type: "PERCENTAGE",
  discount_value: "",
  min_cart_value: "0",
  is_additive: false,
  is_active: true,
  valid_from: "",
  valid_till: "",
  max_discount: "",
};

export default function CouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");

  // Edit modal state
  const [editingCoupon, setEditingCoupon] = useState(null); // null = closed, else coupon object
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editMessage, setEditMessage] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState(null);

  // ── Fetch all coupons ─────────────────────────────────────────────────────
  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setCoupons(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // ── Create coupon ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Creating...");

    const isAdditive = Boolean(formData.is_additive);
    const cleanDiscountType = (formData.discount_type || "PERCENTAGE").replace('_ADDITIVE', '').toUpperCase().trim();

    const payload = {
      code: formData.code.toUpperCase().trim(),
      discount_type: cleanDiscountType,
      discount_value: parseFloat(formData.discount_value) || 0,
      min_cart_value: parseFloat(formData.min_cart_value) || 0,
      is_active: formData.is_active !== undefined ? formData.is_active : true,
      is_additive: isAdditive,
      ...(formData.valid_from ? { valid_from: formData.valid_from } : {}),
      ...(formData.valid_till ? { valid_till: formData.valid_till } : {}),
      ...(formData.max_discount ? { max_discount: parseFloat(formData.max_discount) } : {}),
    };

    try {
      const authHeader = await getAdminAuthHeader();
      const response = await fetch('/api/admin/coupons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (!resData.success) {
        setMessage("Error creating coupon: " + resData.message);
      } else {
        setMessage("Coupon created successfully!");
        setFormData(EMPTY_FORM);
        fetchCoupons();
      }
    } catch (err) {
      console.error('Error creating coupon:', err);
      setMessage("Error creating coupon: " + err.message);
    }

    setTimeout(() => setMessage(""), 4000);
  };

  // ── Toggle active status ──────────────────────────────────────────────────
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    // Optimistic UI update
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: newStatus } : c));

    try {
      const authHeader = await getAdminAuthHeader();
      const response = await fetch('/api/admin/coupons/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ id, is_active: newStatus })
      });

      const resData = await response.json();
      if (!resData.success) {
        // Rollback optimistic update
        setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: currentStatus } : c));
        alert('Failed to update status: ' + (resData.message || 'Server error'));
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      // Rollback
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: currentStatus } : c));
    }
  };

  // ── Open edit modal ───────────────────────────────────────────────────────
  const openEdit = (coupon) => {
    const isAdditive = coupon.is_additive === true || (coupon.discount_type && coupon.discount_type.includes('ADDITIVE'));
    const rawType = (coupon.discount_type || 'PERCENTAGE').replace('_ADDITIVE', '');
    setEditingCoupon(coupon);
    setEditForm({
      code: coupon.code || "",
      discount_type: rawType,
      discount_value: coupon.discount_value ?? "",
      min_cart_value: coupon.min_cart_value ?? "0",
      is_additive: isAdditive,
      is_active: coupon.is_active !== undefined ? coupon.is_active : true,
      valid_from: coupon.valid_from ? coupon.valid_from.substring(0, 10) : "",
      valid_till: coupon.valid_till ? coupon.valid_till.substring(0, 10) : "",
      max_discount: coupon.max_discount ?? "",
    });
    setEditMessage("");
  };

  const closeEdit = () => {
    setEditingCoupon(null);
    setEditMessage("");
  };

  // ── Save edits ────────────────────────────────────────────────────────────
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMessage("Saving...");

    const payload = {
      id: editingCoupon.id,
      code: editForm.code.toUpperCase().trim(),
      discount_type: (editForm.discount_type || "PERCENTAGE").toUpperCase().trim(),
      discount_value: parseFloat(editForm.discount_value) || 0,
      min_cart_value: parseFloat(editForm.min_cart_value) || 0,
      is_active: Boolean(editForm.is_active),
      is_additive: Boolean(editForm.is_additive),
      valid_from: editForm.valid_from || null,
      valid_till: editForm.valid_till || null,
      max_discount: editForm.max_discount ? parseFloat(editForm.max_discount) : null,
    };

    try {
      const authHeader = await getAdminAuthHeader();
      const response = await fetch('/api/admin/coupons/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (!resData.success) {
        setEditMessage("Error: " + resData.message);
      } else {
        setEditMessage("Saved successfully!");
        // Update the list in-place immediately without re-fetching
        if (resData.data && resData.data[0]) {
          setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? resData.data[0] : c));
        } else {
          fetchCoupons();
        }
        setTimeout(() => closeEdit(), 1200);
      }
    } catch (err) {
      console.error('Error editing coupon:', err);
      setEditMessage("Error: " + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete coupon ─────────────────────────────────────────────────────────
  const handleDelete = async (coupon) => {
    const confirmed = window.confirm(
      `Delete coupon "${coupon.code}"?\n\nIf this coupon has been used in past orders, it will be permanently deactivated instead of deleted (to preserve order history).`
    );
    if (!confirmed) return;

    setDeletingId(coupon.id);

    try {
      const authHeader = await getAdminAuthHeader();
      const response = await fetch('/api/admin/coupons/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ id: coupon.id })
      });

      const resData = await response.json();

      if (!resData.success) {
        alert('Delete failed: ' + (resData.message || 'Server error'));
      } else if (resData.deactivated) {
        // Was referenced by orders — show deactivated state instead of removing
        setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: false } : c));
        alert(`"${coupon.code}" could not be deleted because it is referenced by existing orders. It has been permanently deactivated instead.`);
      } else {
        // Actually deleted — remove from list
        setCoupons(prev => prev.filter(c => c.id !== coupon.id));
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
      alert('Delete error: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="erp-content-box">
      <div className="panel-header">
        <h3>Discount &amp; Promotion Engine</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Create and manage promo codes &amp; stackable discount vouchers</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
        {/* ── Create Coupon Form ── */}
        <div style={{ background: "var(--bg-surface)", padding: "20px", borderRadius: "8px", border: "1px solid var(--border)" }}>
          <h4>Create New Coupon</h4>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
            <div>
              <label className="form-label">Coupon Code (e.g. FESTIVAL10)</label>
              <input type="text" className="form-input" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
            </div>
            <div>
              <label className="form-label">Discount Type</label>
              <select className="form-input" value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Coupon Stacking</label>
              <select
                className="form-input"
                value={formData.is_additive ? "ADDITIVE" : "EXCLUSIVE"}
                onChange={e => setFormData({...formData, is_additive: e.target.value === "ADDITIVE"})}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)", background: formData.is_additive ? "rgba(212, 175, 55, 0.1)" : "inherit" }}
              >
                <option value="EXCLUSIVE">Non-Stackable (cannot combine)</option>
                <option value="ADDITIVE">Stackable (can combine with other stackable coupons)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Discount Value</label>
              <input type="number" step="0.01" min="0" className="form-input" value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
            </div>
            <div>
              <label className="form-label">Min Cart Value (₹)</label>
              <input type="number" step="0.01" min="0" className="form-input" value={formData.min_cart_value} onChange={e => setFormData({...formData, min_cart_value: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
            </div>
            {formData.discount_type === "PERCENTAGE" && (
              <div>
                <label className="form-label">Max Discount Cap (₹) <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>— optional</span></label>
                <input type="number" step="0.01" min="0" className="form-input" value={formData.max_discount} onChange={e => setFormData({...formData, max_discount: e.target.value})} placeholder="Leave blank for no cap" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
              </div>
            )}
            <div>
              <label className="form-label">Valid From <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>— optional</span></label>
              <input type="date" className="form-input" value={formData.valid_from} onChange={e => setFormData({...formData, valid_from: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
            </div>
            <div>
              <label className="form-label">Expiry Date <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>— optional</span></label>
              <input type="date" className="form-input" value={formData.valid_till} onChange={e => setFormData({...formData, valid_till: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-input" value={formData.is_active ? "true" : "false"} onChange={e => setFormData({...formData, is_active: e.target.value === "true"})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: "6px", width: "100%", padding: "10px" }}>Create Coupon</button>
            {message && <p style={{ color: message.includes('Error') ? 'red' : 'green', fontSize: "0.9rem" }}>{message}</p>}
          </form>
        </div>

        {/* ── Coupons List ── */}
        <div>
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Stacking</th>
                  <th>Value</th>
                  <th>Min Order</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ textAlign: "center" }}>Loading coupons...</td></tr>
                ) : coupons.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: "center", color: "var(--text-muted)" }}>No coupons found. Create one to get started.</td></tr>
                ) : (
                  coupons.map(coupon => {
                    const isAdditive = coupon.is_additive === true || (coupon.discount_type && coupon.discount_type.includes('ADDITIVE'));
                    const rawType = (coupon.discount_type || 'PERCENTAGE').replace('_ADDITIVE', '');
                    const isDeleting = deletingId === coupon.id;
                    const expiryDate = coupon.valid_till ? new Date(coupon.valid_till).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—';
                    return (
                      <tr key={coupon.id}>
                        <td style={{ fontWeight: "bold" }}>{coupon.code}</td>
                        <td>{rawType}</td>
                        <td>
                          <span style={{
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            background: isAdditive ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            color: isAdditive ? "#10b981" : "#ef4444"
                          }}>
                            {isAdditive ? "➕ Stackable" : "🔒 Non-Stackable"}
                          </span>
                        </td>
                        <td>{rawType === 'PERCENTAGE' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}</td>
                        <td>₹{coupon.min_cart_value}</td>
                        <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{expiryDate}</td>
                        <td>
                          <span className={`status-badge ${coupon.is_active ? 'paid' : 'failed'}`}>
                            {coupon.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {/* Toggle Active/Inactive */}
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleStatus(coupon.id, coupon.is_active);
                              }}
                            >
                              {coupon.is_active ? 'Deactivate' : 'Activate'}
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ borderColor: "#3b82f6", color: "#3b82f6" }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openEdit(coupon);
                              }}
                            >
                              Edit
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ borderColor: "#ef4444", color: "#ef4444" }}
                              disabled={isDeleting}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(coupon);
                              }}
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      {editingCoupon && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "16px"
          }}
          onClick={closeEdit}
        >
          <div
            style={{
              background: "var(--bg-surface, #fff)", borderRadius: "12px",
              padding: "28px", width: "100%", maxWidth: "520px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)", position: "relative",
              maxHeight: "90vh", overflowY: "auto"
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeEdit}
              style={{
                position: "absolute", top: "14px", right: "16px",
                background: "none", border: "none", fontSize: "1.4rem",
                cursor: "pointer", color: "var(--text-muted)"
              }}
            >✕</button>

            <h4 style={{ marginBottom: "18px" }}>Edit Coupon — {editingCoupon.code}</h4>

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="form-label">Coupon Code</label>
                <input type="text" className="form-input" value={editForm.code} onChange={e => setEditForm({...editForm, code: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
              </div>
              <div>
                <label className="form-label">Discount Type</label>
                <select className="form-input" value={editForm.discount_type} onChange={e => setEditForm({...editForm, discount_type: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }}>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="form-label">Stacking</label>
                <select
                  className="form-input"
                  value={editForm.is_additive ? "ADDITIVE" : "EXCLUSIVE"}
                  onChange={e => setEditForm({...editForm, is_additive: e.target.value === "ADDITIVE"})}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }}
                >
                  <option value="EXCLUSIVE">Non-Stackable</option>
                  <option value="ADDITIVE">Stackable</option>
                </select>
              </div>
              <div>
                <label className="form-label">Discount Value</label>
                <input type="number" step="0.01" min="0" className="form-input" value={editForm.discount_value} onChange={e => setEditForm({...editForm, discount_value: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
              </div>
              <div>
                <label className="form-label">Min Cart Value (₹)</label>
                <input type="number" step="0.01" min="0" className="form-input" value={editForm.min_cart_value} onChange={e => setEditForm({...editForm, min_cart_value: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
              </div>
              {editForm.discount_type === "PERCENTAGE" && (
                <div>
                  <label className="form-label">Max Discount Cap (₹) <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>— optional</span></label>
                  <input type="number" step="0.01" min="0" className="form-input" value={editForm.max_discount} onChange={e => setEditForm({...editForm, max_discount: e.target.value})} placeholder="Leave blank for no cap" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
                </div>
              )}
              <div>
                <label className="form-label">Valid From <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>— optional</span></label>
                <input type="date" className="form-input" value={editForm.valid_from} onChange={e => setEditForm({...editForm, valid_from: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
              </div>
              <div>
                <label className="form-label">Expiry Date <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>— optional</span></label>
                <input type="date" className="form-input" value={editForm.valid_till} onChange={e => setEditForm({...editForm, valid_till: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
              </div>
              <div>
                <label className="form-label">Status</label>
                <select className="form-input" value={editForm.is_active ? "true" : "false"} onChange={e => setEditForm({...editForm, is_active: e.target.value === "true"})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: "10px" }} disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1, padding: "10px" }} onClick={closeEdit}>
                  Cancel
                </button>
              </div>

              {editMessage && (
                <p style={{ color: editMessage.includes('Error') ? 'red' : 'green', fontSize: "0.9rem", textAlign: "center" }}>
                  {editMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
