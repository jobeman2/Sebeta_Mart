"use client";

import { useContext, useEffect, useState, useCallback } from "react";
import { Heart, Package, User } from "lucide-react";
import Link from "next/link";
import { AuthContext } from "@/context/Authcontext";

export default function RightIcons() {
  const { user, loading } = useContext(AuthContext);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [countLoading, setCountLoading] = useState<boolean>(true);

  // ---------------- Fetch Wishlist Count ----------------
  const fetchWishlistCount = useCallback(async () => {
    if (user?.role === "buyer") {
      setCountLoading(true);
      try {
        const res = await fetch("http://localhost:5000/buyer/favorites/count", {
          credentials: "include",
        });
        const data = await res.json();
        setWishlistCount(data.count || 0);
      } catch (err) {
        console.error("Failed to fetch wishlist count:", err);
        setWishlistCount(0);
      } finally {
        setCountLoading(false);
      }
    }
  }, [user]);

  // ---------------- Fetch on mount / user change ----------------
  useEffect(() => {
    fetchWishlistCount();
  }, [fetchWishlistCount]);

  // ---------------- Helper functions for real-time update ----------------
  const addFavorite = async (productId: number) => {
    await fetch("http://localhost:5000/buyer/favorites/add", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
    fetchWishlistCount();
  };

  const removeFavorite = async (productId: number) => {
    await fetch("http://localhost:5000/buyer/favorites/remove", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
    fetchWishlistCount();
  };

  // ---------------- Skeleton while loading auth ----------------
  if (loading) {
    return (
      <div className="flex items-center gap-10 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 bg-gray-300 rounded" />
            <div className="w-14 h-3 bg-gray-300 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const role = user?.role; // buyer | seller | delivery

  return (
    <div className="flex items-center gap-10">
      {/* Account - always */}
      <Link
        href={user ? "/dashboard" : "/auth/login"}
        className="flex flex-col items-center text-gray-700"
      >
        <User className="w-6 h-6" />
        <span className="text-[11px] font-light mt-1 tracking-wide">
          {user?.full_name?.split(" ")[0] || "Account"}
        </span>
      </Link>

      {/* My Orders - for ALL roles */}
      <Link href="/shop" className="flex flex-col items-center text-gray-700">
        <Package className="w-6 h-6" />
        <span className="text-[11px] font-light mt-1 tracking-wide">
          My Shop
        </span>
      </Link>

      {/* Wishlist - ONLY buyer (space preserved) */}
      {role === "buyer" ? (
        <Link
          href="/wishlist"
          className="relative flex flex-col items-center text-gray-700"
        >
          <Heart className="w-6 h-6" />
          {/* Show counter only when loaded */}
          {!countLoading && wishlistCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1">
              {wishlistCount}
            </span>
          )}
          {/* Placeholder skeleton if still loading */}
          {countLoading && (
            <span className="absolute -top-1 -right-2 w-3 h-3 bg-gray-300 rounded-full animate-pulse" />
          )}
          <span className="text-[11px] font-light mt-1 tracking-wide">
            Wishlist
          </span>
        </Link>
      ) : (
        // invisible placeholder to keep layout aligned
        <div className="flex flex-col items-center opacity-0 pointer-events-none">
          <Heart className="w-6 h-6" />
          <span className="text-[11px] mt-1">Wishlist</span>
        </div>
      )}
    </div>
  );
}
