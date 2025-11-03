"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-10  w-full">
      <div className="bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Sebeta Mart</h2>
            <p className="text-gray-400 mb-4">
              Your one-stop shop for quality products and great deals.
            </p>
            <div className="flex flex-col text-gray-400">
              <span>Questions? Call us 24/7</span>
              <a href="tel:+0123456789" className="mt-1 hover:text-white">+0123 456 789</a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Useful Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">About Sebeta Mart</a></li>
              <li><a href="#" className="hover:text-white">Our Services</a></li>
              <li><a href="#" className="hover:text-white">How to Shop</a></li>
              <li><a href="#" className="hover:text-white">FAQ</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Payment Methods</a></li>
              <li><a href="#" className="hover:text-white">Returns</a></li>
              <li><a href="#" className="hover:text-white">Shipping</a></li>
              <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">My Account</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Sign In</a></li>
              <li><a href="#" className="hover:text-white">View Cart</a></li>
              <li><a href="#" className="hover:text-white">My Wishlist</a></li>
              <li><a href="#" className="hover:text-white">Track My Order</a></li>
              <li><a href="#" className="hover:text-white">Help</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white py-6 border-b border-[#d3d3d3]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">&copy; 2025 Sebeta Mart. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
