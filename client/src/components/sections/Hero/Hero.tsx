"use client";

import Image from "next/image";
import { ShoppingCart, ArrowRight, Star, StarHalf } from "lucide-react";

export default function Hero() {
  const rating = 4.5; // Example rating
  const maxRating = 5;

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<Star key={i} className="w-5 h-5 text-yellow-400 inline" />);
      } else if (i - rating < 1) {
        stars.push(
          <StarHalf key={i} className="w-5 h-5 text-yellow-400 inline" />
        );
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300 inline" />);
      }
    }
    return stars;
  };

  return (
    <section className="relative bg-gradient-to-r from-[#f0f8ff] via-[#ffffff] to-[#f0f8ff] overflow-hidden">
      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8 py-6 lg:py-12 relative z-10">
        {/* Left: Product Image */}
        <div className="flex-1 relative w-full lg:w-1/2 h-72 sm:h-80 lg:h-96 transform transition-transform hover:scale-105">
          <Image
            src="/images/ear.png"
            alt="Featured Product"
            fill
            className="object-contain drop-shadow-2xl rounded-2xl"
          />
        </div>

        {/* Right: Text / Details */}
        <div className="flex-1 text-center lg:text-left space-y-4 lg:pl-12">
          <span className="text-sm sm:text-base uppercase font-josefin-sans tracking-wider text-[#EF837B]">
            New Arrival
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            Experience Next-Level <br className="hidden sm:block" /> Sound
            Quality
          </h2>
          <p className="text-md sm:text-lg text-gray-700 max-w-md mx-auto lg:mx-0">
            Premium Headphones crafted for music lovers. Clear highs, deep bass,
            and all-day comfort.
          </p>

          {/* Ratings */}
          <div className="flex items-center gap-1 justify-center lg:justify-start">
            {renderStars()}
            <span className="text-gray-600 text-sm ml-2">{rating} / 5</span>
          </div>

          <p className="text-5xl sm:text-5xl text-[#EF837B] font-extrabold tracking-tight">
            ETB 200.99
          </p>
          <button className="mt-4 inline-flex items-center gap-3 bg-[#3399FF] text-white px-6 py-3 text-sm rounded-full text-lg font-semibold shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300">
            <ShoppingCart className="w-5 h-5" /> Shop Now{" "}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Background Blobs */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient overlay */}
        <div className="bg-gradient-to-r from-[#e6f2ff] via-white/50 to-[#e6f2ff] h-full w-full"></div>

        {/* Floating blobs */}
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-[#3399FF]/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#3399FF]/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-1/4 -right-20 w-64 h-64 bg-[#3399FF]/25 rounded-full blur-2xl animate-float-slow"></div>
        <div className="absolute bottom-1/3 -left-20 w-80 h-80 bg-[#3399FF]/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-0 left-1/2 w-40 h-40 bg-[#3399FF]/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-0 right-1/2 w-56 h-56 bg-[#3399FF]/15 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Tailwind Keyframes for floating animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float 10s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
