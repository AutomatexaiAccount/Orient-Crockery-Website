"use client";

import React, { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AnnouncementBar() {
  const [emblaRef] = useEmblaCarousel({ loop: true, watchDrag: false }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);
  const [data, setData] = useState({ enabled: false, announcements: [] });
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("/api/admin/announcements");
        const result = await res.json();
        if (result.success && result.data) {
          setData({
            enabled: result.data.enabled,
            announcements: result.data.config_json?.announcements || [],
          });
        }
      } catch (err) {
        console.error("Failed to load announcements", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  if (loading || !data.enabled || data.announcements.length === 0) return null;
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="announcement-bar">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {data.announcements.map((ann, idx) => (
            <div className="embla__slide" key={idx}>
              {ann.link ? (
                <Link href={ann.link} className="announcement-text">
                  {ann.text}
                </Link>
              ) : (
                <span className="announcement-text">{ann.text}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .announcement-bar {
          background-color: #8fb2a6; /* Chumbak style subtle green/teal */
          background: linear-gradient(90deg, #7c9f93 0%, #8fb2a6 50%, #7c9f93 100%);
          color: #ffffff;
          padding: 8px 0;
          text-align: center;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          z-index: 100;
          position: relative;
        }
        .embla {
          overflow: hidden;
          max-width: 800px;
          margin: 0 auto;
        }
        .embla__container {
          display: flex;
        }
        .embla__slide {
          flex: 0 0 100%;
          min-width: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .announcement-text {
          color: #ffffff;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .announcement-text:hover {
          opacity: 0.8;
        }
        @media (max-width: 768px) {
          .announcement-bar {
            font-size: 0.75rem;
            padding: 10px 10px;
          }
        }
      `}</style>
    </div>
  );
}
