"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../../supabase';

export default function HeroCarousel() {
  const [desktopEmblaRef, desktopEmblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [mobileEmblaRef, mobileEmblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
        
      if (!error && data) {
        setBanners(data);
      }
      setLoading(false);
    };
    fetchBanners();
  }, []);

  const scrollDesktopPrev = useCallback(() => {
    if (desktopEmblaApi) desktopEmblaApi.scrollPrev();
  }, [desktopEmblaApi]);

  const scrollDesktopNext = useCallback(() => {
    if (desktopEmblaApi) desktopEmblaApi.scrollNext();
  }, [desktopEmblaApi]);

  const scrollMobilePrev = useCallback(() => {
    if (mobileEmblaApi) mobileEmblaApi.scrollPrev();
  }, [mobileEmblaApi]);

  const scrollMobileNext = useCallback(() => {
    if (mobileEmblaApi) mobileEmblaApi.scrollNext();
  }, [mobileEmblaApi]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Set initial value
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeBanners = isMobile 
    ? banners.filter(b => b.mobile_image_url) 
    : banners.filter(b => b.desktop_image_url);

  if (loading) return <div style={{ height: '600px', backgroundColor: '#f5f5f5', width: '100%' }} />;
  if (banners.length === 0) {
    return (
      <section className="hero-split">
        <div className="hero-split-text">
          <p className="hero-subtitle">ORIENT CROCKERIES</p>
          <h1 className="hero-title">Dining Elevated</h1>
          <p className="hero-desc">
            Est. 1994. Curating and crafting the world&apos;s finest dinnerware, professional cookware, and organic acacia woodcraft. For five-star hospitality and exquisite homes.
          </p>
          <div className="cta-group">
            <Link href="/catalog" className="btn btn-primary">
              Explore Collections
            </Link>
            <a href="#collections" className="btn btn-outline">
              Shop by Category
            </a>
          </div>
        </div>
        <div className="hero-split-image" style={{ position: 'relative' }}>
          <img 
            src="/images/crockery_dinner_set.png" 
            alt="Premium Dinnerware Collection"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </section>
    );
  }

  // If there are no banners for the current device, don't show the slider at all
  if (activeBanners.length === 0) {
    return null; 
  }

  return (
    <div className="embla" ref={desktopEmblaRef} style={{ overflow: 'hidden', position: 'relative', width: '100%' }}>
      <div className="embla__container" style={{ display: 'flex' }}>
        {activeBanners.map((banner) => (
          <div className="embla__slide" key={banner.id} style={{ flex: '0 0 100%', minWidth: '0', position: 'relative' }}>
            <Link href={banner.click_link || '/catalog'}>
              <div className="hero-banner-image-wrapper">
                <img
                  src={isMobile ? banner.mobile_image_url : banner.desktop_image_url}
                  alt={banner.alt_text || 'Promotional Banner'}
                  className="banner-img"
                />
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      {/* Navigation Buttons */}
      <button onClick={scrollDesktopPrev} className="embla__prev" aria-label="Previous slide">
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      <button onClick={scrollDesktopNext} className="embla__next" aria-label="Next slide">
        <i className="fa-solid fa-chevron-right"></i>
      </button>

      <style jsx>{`
        .hero-banner-image-wrapper {
          position: relative;
          width: 100%;
          height: 500px; /* Reduced Fixed Desktop Box */
          display: flex;
          align-items: flex-start; /* Attach to top header */
          justify-content: center;
          background-color: #f8fafc;
        }
        .banner-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          display: block;
        }

        .embla__prev, .embla__next {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.8);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: #333;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 10;
          transition: all 0.2s ease;
        }
        .embla__prev:hover, .embla__next:hover {
          background: #fff;
          transform: translateY(-50%) scale(1.1);
        }
        .embla__prev { left: 20px; }
        .embla__next { right: 20px; }

        @media (max-width: 768px) {
          .hero-banner-image-wrapper {
            height: 350px; /* Reduced Fixed Mobile Box */
          }
          .embla__prev, .embla__next {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
