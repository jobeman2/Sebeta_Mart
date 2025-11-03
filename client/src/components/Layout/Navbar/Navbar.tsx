"use client";

import { ShoppingCart, Search, Heart, User, Menu } from "lucide-react";
import Link from "next/link";
import BottomNav from "./BottomNav";
import RightIcons from "./RightIcons";

export default function Navbar() {
  return (
    <nav className="w-full bg-white font-dm-sans  border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 h-26 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button className="md:hidden">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold text-gray-800 tracking-wide">
              Sebeta <span className="text-[#3399ff]"> Mart </span>
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center w-1/2">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full border border-gray-300 font-dm-sans rounded-full py-3.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-500" />
          </div>
        </div>

        {/* Right Icons */}
      <RightIcons/>
      </div>

  <BottomNav/>
    </nav>
  );
}
