import React from 'react';
import { ArrowRight } from 'lucide-react';

const CtaBanner: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div
        className="relative rounded-xl overflow-hidden flex items-center gap-4 lg:gap-8 p-4 lg:p-6"
        style={{
          backgroundImage: 'url(/images/bg-1.jpg)', // Sebeta Mart promo background
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Hero Image: can be a shopping/cart image */}
        <div className="flex-shrink-0 relative z-10">
          <img
            src="/images/camera.png" // change to your Sebeta Mart hero image
            alt="Sebeta Mart Hero"
            className="h-24 w-auto lg:h-32 object-contain"
          />
        </div>

        {/* Content */}
        <div className="flex-1 text-white relative z-10">
          <p className="text-lg lg:text-xl font-medium">
            Sebeta Mart Deals of the Day
          </p>
          <h2 className="text-2xl lg:text-3xl font-bold mt-1 lg:mt-2">
            Fresh Groceries & Daily Essentials
          </h2>
          <p className="text-sm lg:text-base mt-1 text-gray-200">
            Shop quality products at unbeatable prices!
          </p>
        </div>

        {/* Button */}
        <a
          href="/shop" // link to your main shop page
          className="relative z-10 inline-flex items-center gap-2 bg-white text-blue-600 font-semibold py-2 px-4 lg:px-6 rounded-full shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
        >
          <span>Shop Now</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default CtaBanner;
