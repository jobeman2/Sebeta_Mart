"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ChevronDown, Home, ShoppingCart, Grid, Info, Phone, CircleQuestionMarkIcon, BadgeQuestionMark } from "lucide-react";

export default function BottomNav() {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [active, setActive] = useState("Home");

  const navLinks = [
    { name: "Electronics", href: "/categories/electronics" },
    { name: "Clothing", href: "/categories/clothing" },
    { name: "Accessories", href: "/categories/accessories" },
    { name: "Home & Living", href: "/categories/home-living" },
    { name: "Toys", href: "/categories/toys" },
  ];

  const navItems = [
    { name: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
    { name: "Shop", href: "/shop", icon: <ShoppingCart className="w-4 h-4" /> },
    { name: "Categories", href: "#", icon: <Grid className="w-4 h-4" /> },
    { name: "About", href: "/about", icon: <Info className="w-4 h-4" /> },
    { name: "Contact", href: "/contact", icon: <Phone className="w-4 h-4" /> },
    { name: "FAQ", href: "/faq", icon: <CircleQuestionMarkIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="left-0 w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-20">
        <div className="flex items-center gap-4 md:gap-16">
          <button className="md:hidden p-2 rounded hover:bg-gray-200 transition">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          <div className="relative hidden md:block">
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center gap-2 px-4 py-4 bg-[#f9f9f9] transition cursor-pointer"
            >
              <Menu className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700 font-medium">Browse Categories</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {categoriesOpen && (
              <div className="absolute top-full mt-2 bg-white shadow-lg rounded-md py-2 w-60">
                {navLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.href}
                    className="flex items-center text-sm px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Left side Navigation Items */}
          <ul className="hidden md:flex items-center gap-8 text-base text-gray-700">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => setActive(item.name)}
                  className={`flex items-center text-sm gap-2 transition relative ${
                    active === item.name ? "text-[#3399ff]" : "hover:text-black"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  <span
                    className={`absolute left-0 -bottom-1 h-[1px] bg-[#3399ff] transition-all ${
                      active === item.name ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  ></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Section with Divider and Text */}
        <div className="flex items-center gap-8">
          {/* Vertical Divider */}
          <div className="h-8 w-[1px] bg-gray-300"></div>

          {/* Right Text Section */}
          <div className="text-sm text-gray-700">
            <span>Welcome to Sebeta Mart</span>
            <br />
            <span className="text-xs">Your one-stop shop for all things</span>
          </div>
        </div>
      </div>
    </div>
  );
}
