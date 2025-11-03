"use client";

import React, { useState } from "react"; // Import useState hook
import { Heart, ShoppingCart } from "lucide-react";

export interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
  sellerName: string;
  sellerImage: string;
  rating: number;
  reviews: number;
}

const products: Product[] = [
  {
    id: 1,
    name: "Ethiopian Coffee Beans",
    price: "350",
    image: "/images/product/ear.png",
    category: "Food & Drinks",
    sellerName: "Ethiopian Seller",
    sellerImage: "/images/product/2.png",
    rating: 4.5,
    reviews: 120,
  },
  {
    id: 2,
    name: "Berbere Spice Mix",
    price: "120",
    image: "/images/product/2.png",
    category: "Spices",
    sellerName: "Spice World",
    sellerImage: "/images/product/seller-2.jpg",
    rating: 4.0,
    reviews: 200,
  },
  {
    id: 3,
    name: "Traditional Basket",
    price: "500",
    image: "/images/product/shoes.png",
    category: "Crafts",
    sellerName: "Basket Maker",
    sellerImage: "/images/product/seller-3.jpg",
    rating: 4.8,
    reviews: 75,
  },
  {
    id: 4,
    name: "Ethiopian Honey",
    price: "250",
    image: "/images/product/4.png",
    category: "Food & Drinks",
    sellerName: "Honey Farm",
    sellerImage: "/images/product/seller-4.jpg",
    rating: 4.2,
    reviews: 150,
  },
];

export default function ProductsGrid() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const handleAddToCart = (product: Product) => {
    console.log(`Added ${product.name} to the cart`);
    // You can implement the actual logic to add to cart
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(product => product.category === activeCategory);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900">
            New Arrivals
          </h2>
         
        </div>
        
        {/* Category Tabs */}
        <div className="flex gap-4 text-2xl uppercase">
          {["All", "Food & Drinks", "Spices", "Crafts"].map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`${
                activeCategory === category ? "text-blue-600 uppercase border-b-2 border-blue-600" : "text-gray-700 uppercase"
              } text-sm uppercase font-medium`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white border-1 border-[#EBEBEB] transition relative group"
          >
            {/* Image Section */}
            <div className="-50 h-50 flex justify-center items-center relative mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-46 h-46 flex justify-center object-cover rounded-t-lg"
              />
            </div>

            {/* Card Content */}
            <div className="p-4 flex flex-col gap-2">
              <div className="text-sm text-[#AAA] font-medium">{product.category}</div>
              <h3 className="text-lg font-dm-sans font-semibold text-gray-800">{product.name}</h3>
              <p className="text-[#EF837B] font-josefin-sans font-lg">ETB {product.price}</p>

              {/* Add to Cart and Favorites Buttons */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex items-right p-2 rounded-none border border-gray-300 hover:bg-gray-100 transition gap-2  text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
                <button
                  className="flex items-center gap-2 border border-gray-300 hover:bg-gray-100 p-2 rounded-full transition"
                >
                  <Heart className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            {/* Seller Section */}
            <div className="flex bg-[#f9f9f9] items-center p-4">
              <img
                src={product.sellerImage}
                alt={product.sellerName}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div className="text-sm font-medium text-gray-700">{product.sellerName}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
