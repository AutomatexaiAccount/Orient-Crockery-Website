"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import imageCompression from "browser-image-compression";

export default function HomepageCollectionsTab() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: "", sort_order: 0 });
  const [uploadImage, setUploadImage] = useState(null);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('homepage_collections').select('*').order('sort_order', { ascending: true });
    if (!error && data) {
      setCollections(data);
    } else if (error) {
      console.error("Error fetching homepage collections:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadImage) {
      setMessage("Please select an image first.");
      return;
    }

    setIsUploading(true);
    setMessage("Uploading image...");

    try {
      // 1. Compress Image
      const options = { maxSizeMB: 5.0, maxWidthOrHeight: 4000, initialQuality: 0.95, useWebWorker: true };
      let fileToUpload = uploadImage;
      try {
        fileToUpload = await imageCompression(uploadImage, options);
      } catch (compErr) {
        console.warn("Compression skipped, uploading original:", compErr);
      }

      // 2. Upload to Storage
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `home_col_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, fileToUpload);
      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      const imageUrl = urlData.publicUrl;

      setMessage("Saving to database...");

      // 4. Save to Database
      const payload = {
        title: formData.title.trim(),
        image_url: imageUrl,
        sort_order: parseInt(formData.sort_order) || 0
      };

      const { error: dbError } = await supabase.from('homepage_collections').insert([payload]);
      
      if (dbError) {
        throw dbError;
      } else {
        setMessage("Collection added successfully!");
        setFormData({ title: "", sort_order: 0 });
        setUploadImage(null);
        // Reset file input manually
        const fileInput = document.getElementById("collection-image-upload");
        if (fileInput) fileInput.value = "";
        
        fetchCollections();
      }
    } catch (err) {
      console.error('Error adding collection:', err);
      setMessage("Error: " + err.message);
    } finally {
      setIsUploading(false);
    }

    setTimeout(() => setMessage(""), 4000);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this collection from the homepage?");
    if (!confirmed) return;

    setDeletingId(id);

    try {
      const { error } = await supabase.from('homepage_collections').delete().eq('id', id);
      if (error) {
        alert("Failed to delete: " + error.message);
      } else {
        setCollections(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Error deleting collection:', err);
      alert('Delete error: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="erp-content-box">
      <div className="panel-header">
        <h3>Homepage Collections</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Manage the collections shown on the homepage</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
        {/* ── Add New Form ── */}
        <div style={{ background: "var(--bg-surface)", padding: "20px", borderRadius: "8px", border: "1px solid var(--border)" }}>
          <h4>Add New Collection</h4>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
            <div>
              <label className="form-label">Title / Name</label>
              <input type="text" className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
            </div>
            <div>
              <label className="form-label">Upload Image</label>
              <input 
                id="collection-image-upload"
                type="file" 
                accept="image/*" 
                className="form-input" 
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadImage(e.target.files[0]);
                  }
                }} 
                required 
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-main)" }} 
              />
            </div>
            <div>
              <label className="form-label">Sort Order (Lower appears first)</label>
              <input type="number" className="form-input" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border)" }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isUploading} style={{ marginTop: "6px", width: "100%", padding: "10px" }}>
              {isUploading ? "Uploading..." : "Add Collection"}
            </button>
            {message && <p style={{ color: message.includes('Error') ? 'red' : 'green', fontSize: "0.9rem" }}>{message}</p>}
          </form>
        </div>

        {/* ── List ── */}
        <div>
          <div className="table-responsive">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ textAlign: "center" }}>Loading...</td></tr>
                ) : collections.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)" }}>No collections found. Add one to show on homepage.</td></tr>
                ) : (
                  collections.map(col => (
                    <tr key={col.id}>
                      <td>
                        <img src={col.image_url} alt={col.title} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                      </td>
                      <td style={{ fontWeight: "bold" }}>{col.title}</td>
                      <td>{col.sort_order}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ borderColor: "#ef4444", color: "#ef4444" }}
                          disabled={deletingId === col.id}
                          onClick={() => handleDelete(col.id)}
                        >
                          {deletingId === col.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
