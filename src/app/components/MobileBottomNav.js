"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cart } = useApp();

  const [animateBadge, setAnimateBadge] = React.useState(false);
  const cartItemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  React.useEffect(() => {
    if (cartItemCount > 0) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartItemCount]);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    router.push("/");
  };

  return (
    <div className="mobile-bottom-nav">
      <Link href="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}>
        <i className="fa-solid fa-house"></i>
        <span>Home</span>
      </Link>

      <Link href="/account" className={`bottom-nav-item ${pathname === '/account' ? 'active' : ''}`}>
        <i className="fa-solid fa-user"></i>
        <span>Account</span>
      </Link>

      <Link href="/cart" className={`bottom-nav-item ${pathname === '/cart' ? 'active' : ''}`}>
        <div className="bottom-nav-icon-wrapper">
          <i className="fa-solid fa-cart-shopping"></i>
          {cartItemCount > 0 && (
            <span className={`bottom-nav-badge ${animateBadge ? 'bump' : ''}`}>{cartItemCount}</span>
          )}
        </div>
        <span>Cart</span>
      </Link>

      {user ? (
        <button onClick={handleLogout} className="bottom-nav-item bottom-nav-btn">
          <i className="fa-solid fa-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      ) : (
        <Link href="/auth" className={`bottom-nav-item ${pathname === '/auth' ? 'active' : ''}`}>
          <i className="fa-solid fa-right-to-bracket"></i>
          <span>Login</span>
        </Link>
      )}
    </div>
  );
}
