"use client";

import { useState } from "react";
import { Search, Menu } from "lucide-react";
import Link from "next/link";
import BottomNav from "./BottomNav";
import RightIcons from "./RightIcons";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-white font-dm-sans border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-24 py-3">
        {/* Left Section: Mobile Menu + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold text-gray-800 tracking-wide">
              Sebeta <span className="text-[#3399ff]">Mart</span>
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center w-1/2">
          <form className="relative w-full" action="/search" method="GET">
            <input
              type="text"
              name="q"
              placeholder="Search products..."
              className="w-full border border-gray-300 font-dm-sans rounded-full py-3.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="absolute right-3 top-3.5">
              <Search className="w-5 h-5 text-gray-500" />
            </button>
          </form>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          <RightIcons />
        </div>
      </div>

      {/* Mobile Menu (optional sliding menu) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md w-full absolute top-24 left-0 z-50 p-4 flex flex-col gap-3">
          <Link href="/" className="text-gray-700 font-medium hover:text-blue-500">
            Home
          </Link>
          <Link href="/orders" className="text-gray-700 font-medium hover:text-blue-500">
            My Orders
          </Link>
          <Link href="/wishlist" className="text-gray-700 font-medium hover:text-blue-500">
            Wishlist
          </Link>
          <Link href="/auth/login" className="text-gray-700 font-medium hover:text-blue-500">
            Account
          </Link>
        </div>
      )}

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />
    </nav>
  );
}
