"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import Image from "next/image";
import imageCompression from "browser-image-compression";

export default function HeroBannersTab() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState(null);

  // Announcement Bar State
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncementText, setNewAnnouncementText] = useState("");
  const [newAnnouncementLink, setNewAnnouncementLink] = useState("");
  const [announcementSaving, setAnnouncementSaving] = useState(false);

  // Form State
  const [desktopImage, setDesktopImage] = useState("");
  const [mobileImage, setMobileImage] = useState("");
  const [clickLink, setClickLink] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // File Upload State
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchBanners();
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/admin/announcements");
      const result = await res.json();
      if (result.success && result.data) {
        setAnnouncementEnabled(result.data.enabled);
        setAnnouncements(result.data.config_json?.announcements || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveAnnouncements = async (updatedEnabled, updatedList) => {
    setAnnouncementSaving(true);
    try {
      await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: updatedEnabled !== undefined ? updatedEnabled : announcementEnabled,
          announcements: updatedList || announcements
        })
      });
      alert("Announcements saved successfully!");
    } catch (e) {
      alert("Failed to save announcements");
    }
    setAnnouncementSaving(false);
  };

  const handleAddAnnouncement = () => {
    if (!newAnnouncementText) return;
    const newList = [...announcements, { text: newAnnouncementText, link: newAnnouncementLink }];
    setAnnouncements(newList);
    setNewAnnouncementText("");
    setNewAnnouncementLink("");
    saveAnnouncements(undefined, newList);
  };

  const handleRemoveAnnouncement = (index) => {
    const newList = announcements.filter((_, i) => i !== index);
    setAnnouncements(newList);
    saveAnnouncements(undefined, newList);
  };

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .order("sort_order", { ascending: true });
    
    if (error) {
      console.error("Error fetching banners:", error);
      alert("Error fetching banners. Did you run the SQL script?");
    } else {
      setBanners(data || []);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!desktopImage && !desktopFile && !mobileImage && !mobileFile) {
      alert("At least one image (Desktop or Mobile) is required.");
      return;
    }

    setIsUploading(true);
    let finalDesktopUrl = desktopImage;
    let finalMobileUrl = mobileImage;

    const uploadImage = async (file) => {
      try {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);
        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `banner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, compressedFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
        return urlData.publicUrl;
      } catch (err) {
        console.error("Upload failed", err);
        alert("Image upload failed");
        return null;
      }
    };

    if (desktopFile) {
      const uploadedUrl = await uploadImage(desktopFile);
      if (uploadedUrl) finalDesktopUrl = uploadedUrl;
    }

    if (mobileFile) {
      const uploadedUrl = await uploadImage(mobileFile);
      if (uploadedUrl) finalMobileUrl = uploadedUrl;
    }

    const payload = {
      desktop_image_url: finalDesktopUrl,
      mobile_image_url: finalMobileUrl,
      click_link: clickLink,
      sort_order: sortOrder,
      is_active: isActive
    };

    if (editingBanner) {
      const { error } = await supabase
        .from("hero_banners")
        .update(payload)
        .eq("id", editingBanner.id);
      if (error) alert("Error updating: " + error.message);
      else fetchBanners();
    } else {
      const { error } = await supabase
        .from("hero_banners")
        .insert([payload]);
      if (error) alert("Error adding: " + error.message);
      else fetchBanners();
    }
    
    setIsUploading(false);
    resetForm();
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setDesktopImage(banner.desktop_image_url || "");
    setMobileImage(banner.mobile_image_url || "");
    setClickLink(banner.click_link || "");
    setSortOrder(banner.sort_order || 0);
    setIsActive(banner.is_active);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      const { error } = await supabase.from("hero_banners").delete().eq("id", id);
      if (error) alert("Error deleting: " + error.message);
      else fetchBanners();
    }
  };

  const resetForm = () => {
    setEditingBanner(null);
    setDesktopImage("");
    setMobileImage("");
    setClickLink("");
    setSortOrder(0);
    setIsActive(true);
    setDesktopFile(null);
    setMobileFile(null);
  };

  return (
    <div className="admin-tab-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2>Manage Hero Banners & Announcements</h2>
      </div>

      {/* ANNOUNCEMENT BAR MANAGER */}
      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <h3 style={{ margin: 0 }}>Top Announcement Bar</h3>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: "bold" }}>
            <input 
              type="checkbox" 
              checked={announcementEnabled} 
              onChange={(e) => {
                setAnnouncementEnabled(e.target.checked);
                saveAnnouncements(e.target.checked, undefined);
              }} 
              style={{ width: "18px", height: "18px" }}
            />
            Show Bar on Website
          </label>
        </div>
        
        <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: "1.5" }}>
          <strong>How it works:</strong> This bar appears at the very top of your website. It automatically slides through all the text items you add below, changing every 4 seconds. 
          <br/><strong>Click Link (Optional):</strong> If you type a link here (like <code>/offers</code> or <code>/catalog</code>), clicking the announcement text will take the customer directly to that page! If you leave it blank, it will just be plain text.
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {announcements.length === 0 ? (
            <p style={{ color: "#64748b", margin: 0 }}>No announcements added.</p>
          ) : (
            announcements.map((ann, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "10px 15px", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
                <div>
                  <strong>{ann.text}</strong> {ann.link && <span style={{ color: "#3b82f6", marginLeft: "10px", fontSize: "0.85rem" }}>({ann.link})</span>}
                </div>
                <button onClick={() => handleRemoveAnnouncement(idx)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
          <div style={{ flex: 2 }}>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px" }}>Announcement Text *</label>
            <input 
              type="text" 
              value={newAnnouncementText}
              onChange={e => setNewAnnouncementText(e.target.value)}
              placeholder="e.g. FLAT 40% OFF ON ORDERS ABOVE ---2999"
              style={{ width: "100%", padding: "0.8rem", border: "1px solid #cbd5e1", borderRadius: "4px" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "5px" }}>Click Link (Optional)</label>
            <input 
              type="text" 
              value={newAnnouncementLink}
              onChange={e => setNewAnnouncementLink(e.target.value)}
              placeholder="/catalog"
              style={{ width: "100%", padding: "0.8rem", border: "1px solid #cbd5e1", borderRadius: "4px" }}
            />
          </div>
          <div>
            <button onClick={handleAddAnnouncement} className="btn btn-primary" disabled={announcementSaving || !newAnnouncementText} style={{ height: "46px" }}>
              Add to Bar
            </button>
          </div>
        </div>
      </div>

      <hr style={{ margin: "2rem 0", borderColor: "#e2e8f0" }} />

      <h3>Image Carousel Banners</h3>
      
      <div style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: "1.5", background: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
        <strong>How it works:</strong> These images appear in the large sliding carousel right below the header on your homepage.
        <ul style={{ margin: "8px 0 0 20px", padding: 0 }}>
          <li style={{ marginBottom: "5px" }}>The carousel mathematically scales your images to fit perfectly without any cropping.</li>
          <li style={{ marginBottom: "5px" }}>You can upload separate images for Desktop and Mobile (highly recommended for best quality).</li>
          <li style={{ marginBottom: "5px" }}>If you only upload a Desktop image, it will automatically shrink to fit Mobile phones too.</li>
          <li>Turn off <strong>"Is Active"</strong> to temporarily hide a banner without having to delete it.</li>
        </ul>
      </div>

      {loading ? (
        <p>Loading banners...</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem", marginBottom: "3rem" }}>
          {banners.length === 0 ? (
            <p style={{ color: "#64748b" }}>No banners found. Add one below!</p>
          ) : (
            banners.map(banner => (
              <div key={banner.id} style={{ display: "flex", gap: "1rem", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "1rem", borderRadius: "8px", alignItems: "center" }}>
                <div style={{ width: "150px", height: "80px", position: "relative", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  {(banner.desktop_image_url || banner.mobile_image_url) && (
                    <Image src={banner.desktop_image_url || banner.mobile_image_url} alt="Banner" fill style={{ objectFit: "cover" }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  {/* Banner details removed to simplify view */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", background: banner.is_active ? "#dcfce7" : "#fee2e2", color: banner.is_active ? "#166534" : "#991b1b" }}>
                      {banner.is_active ? "Active" : "Inactive"}
                    </span>
                    <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", background: "#e0e7ff", color: "#3730a3" }}>
                      {banner.desktop_image_url && banner.mobile_image_url ? 'Desktop & Mobile' : (banner.desktop_image_url ? 'Desktop Only' : 'Mobile Only')}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleEdit(banner)} className="btn btn-outline" style={{ padding: "0.5rem 1rem" }}>Edit</button>
                  <button onClick={() => handleDelete(banner.id)} className="btn btn-outline" style={{ padding: "0.5rem 1rem", borderColor: "#ef4444", color: "#ef4444" }}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "2rem" }}>
        <h3>{editingBanner ? "Edit Banner" : "Add New Banner"}</h3>
        <form onSubmit={handleSave} style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Desktop Image (Optional if Mobile is provided)</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setDesktopFile(e.target.files[0])} 
                style={{ flex: 1, padding: "0.8rem", border: "1px solid #cbd5e1", borderRadius: "4px" }}
              />
            </div>
            {desktopFile && <small style={{ color: "green", display: "block", marginTop: "5px" }}>Selected: {desktopFile.name}</small>}
            {editingBanner && desktopImage && !desktopFile && <small style={{ color: "blue", display: "block", marginTop: "5px" }}>Current image is set. Upload new to replace.</small>}
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Mobile Image (Optional)</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setMobileFile(e.target.files[0])} 
                style={{ flex: 1, padding: "0.8rem", border: "1px solid #cbd5e1", borderRadius: "4px" }}
              />
            </div>
            {mobileFile && <small style={{ color: "green", display: "block", marginTop: "5px" }}>Selected: {mobileFile.name}</small>}
            {editingBanner && mobileImage && !mobileFile && <small style={{ color: "blue", display: "block", marginTop: "5px" }}>Current image is set. Upload new to replace.</small>}
          </div>

          <div style={{ display: "flex", alignItems: "center", paddingBottom: "10px", marginTop: "0.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: "bold" }}>
              <input 
                type="checkbox" 
                checked={isActive} 
                onChange={(e) => setIsActive(e.target.checked)} 
                style={{ width: "20px", height: "20px" }}
              />
              Is Active
            </label>
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button type="submit" className="btn btn-primary" disabled={isUploading}>
              {isUploading ? "Uploading & Saving..." : (editingBanner ? "Update Banner" : "Save Banner")}
            </button>
            {editingBanner && (
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel Edit / Add New
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
