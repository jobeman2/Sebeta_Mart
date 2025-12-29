// components/ShopSocial/ShopSocial.tsx
'use client'
import React, { useState } from 'react';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Send,
  ArrowRight
} from 'lucide-react';

interface SocialLink {
  platform: string;
  url: string;
  title: string;
  icon: React.ReactNode;
}

interface ShopSocialProps {
  className?: string;
  title?: string;
  description?: string;
  socialLinks?: SocialLink[];
  newsletterTitle?: string;
  newsletterDescription?: string;
  couponText?: string;
  backgroundImage?: string;
  onSubmitNewsletter?: (email: string) => void;
}

const ShopSocial: React.FC<ShopSocialProps> = ({
  className = '',
  title = 'Shop Social',
  description = 'Donec nec justo eget felis facilisis fermentum. Aliquam porttitor mauris sit amet orci.',
  socialLinks,
  newsletterTitle = 'Get the Latest Deals',
  newsletterDescription = 'and receive',
  couponText = '$20 coupon',
  backgroundImage = 'assets/images/demos/demo-3/bg-2.jpg',
  onSubmitNewsletter,
}) => {
  const [email, setEmail] = useState('');

  // Default social links with Lucide icons
  const defaultSocialLinks: SocialLink[] = [
    { 
      platform: 'facebook', 
      url: '#', 
      title: 'Facebook',
      icon: <Facebook className="w-5 h-5" />
    },
    { 
      platform: 'twitter', 
      url: '#', 
      title: 'Twitter',
      icon: <Twitter className="w-5 h-5" />
    },
    { 
      platform: 'instagram', 
      url: '#', 
      title: 'Instagram',
      icon: <Instagram className="w-5 h-5" />
    },
    { 
      platform: 'youtube', 
      url: '#', 
      title: 'Youtube',
      icon: <Youtube className="w-5 h-5" />
    },
    { 
      platform: 'send', 
      url: '#', 
      title: 'Other Platforms',
      icon: <Send className="w-5 h-5" />
    },
  ];

  const links = socialLinks || defaultSocialLinks;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitNewsletter) {
      onSubmitNewsletter(email);
    }
    setEmail('');
  };

  // Platform-specific hover colors
  const getPlatformHoverClass = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return 'hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2]';
      case 'twitter':
        return 'hover:bg-[#1da1f2] hover:text-white hover:border-[#1da1f2]';
      case 'instagram':
        return 'hover:bg-gradient-to-br hover:from-[#405de6] hover:via-[#833ab4] hover:to-[#e1306c] hover:text-white hover:border-transparent';
      case 'youtube':
        return 'hover:bg-[#ff0000] hover:text-white hover:border-[#ff0000]';
      case 'send':
        return 'hover:bg-primary hover:text-white hover:border-primary';
      default:
        return 'hover:bg-primary hover:text-white hover:border-primary';
    }
  };

  return (
    <div 
      className={`relative py-16 md:py-24 my-8 md:my-16 ${backgroundImage ? 'bg-cover bg-center bg-no-repeat' : 'bg-gradient-to-r from-blue-50 to-purple-50'} ${className}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
    >
      {/* Background overlay - only show if there's a background image */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
      )}
      
      <div className="container relative mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-12 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center">
            
            {/* Social Media Section */}
            <div className="lg:w-1/2 lg:pr-10 mb-12 lg:mb-0">
              <div className="text-center lg:text-left px-2">
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
                  {title}
                </h3>
                <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
                  {description}
                </p>
                
                {/* Social Icons */}
                <div className="flex justify-center lg:justify-start gap-3 md:gap-4 mt-6 md:mt-8">
                  {links.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      className={`
                        flex items-center justify-center
                        w-10 h-10 md:w-12 md:h-12
                        rounded-full
                        bg-gray-50 text-gray-700
                        border border-gray-200
                        transition-all duration-300 ease-out
                        hover:scale-110
                        shadow-md hover:shadow-xl
                        ${getPlatformHoverClass(link.platform)}
                      `}
                      title={link.title}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      aria-label={`Follow us on ${link.title}`}
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden lg:block w-px h-40 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-4 lg:mx-8"></div>

            {/* Horizontal Divider for mobile */}
            <div className="lg:hidden w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8"></div>

            {/* Newsletter Section */}
            <div className="lg:w-1/2 lg:pl-10">
              <div className="text-center lg:text-left px-2">
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
                  {newsletterTitle}
                </h3>
                <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">
                  {newsletterDescription} <br />
                  <span className="text-primary font-bold text-amber-600">
                    {couponText}
                  </span> for first shopping
                </p>
                
                {/* Newsletter Form */}
                <form onSubmit={handleSubmit} className="max-w-md mx-auto lg:mx-0">
                  <div className="relative">
                    <input
                      type="email"
                      className="w-full px-6 py-4 md:py-5 pr-24 text-gray-700 bg-gray-50 rounded-full border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all duration-300 placeholder:text-gray-400"
                      placeholder="Enter your Email Address"
                      aria-label="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <span className="hidden sm:inline">Subscribe</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    By subscribing, you agree to our Privacy Policy and consent to receive updates.
                  </p>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSocial;