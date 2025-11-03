"use client";

import { useContext } from "react";
import { Heart, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { AuthContext } from "@/context/Authcontext";

export default function RightIcons() {
  const { user, loading } = useContext(AuthContext);

  // 🔹 Wait until auth state is resolved
  if (loading) return null; // or a spinner if you prefer

  return (
    <div className="flex items-center gap-10">
      {/* Wishlist - only show for non-sellers */}
      {user?.role !== "seller" && (
        <Link href="#" className="relative flex flex-col items-center text-gray-700">
          <Heart className="w-6 h-6" />
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1">
            2
          </span>
          <span className="text-[11px] font-light mt-1 tracking-wide">Wishlist</span>
        </Link>
      )}

      {/* Cart */}
      <Link href="#" className="relative flex flex-col items-center text-gray-700">
        <ShoppingCart className="w-6 h-6" />
        <span className="absolute -top-1 -right-2 bg-blue-500 text-white text-[10px] rounded-full px-1">
          3
        </span>
        <span className="text-[11px] font-light mt-1 tracking-wide">Cart</span>
      </Link>

      {/* Account */}
      <Link
        href={user ? "/dashboard" : "/auth/login"}
        className="flex flex-col items-center text-gray-700"
      >
        <User className="w-6 h-6" />
        <span className="text-[11px] font-light mt-1 tracking-wide">
          {user?.full_name?.split(" ")[0] || user?.email || "Account"}
        </span>
      </Link>
    </div>
  );
}
