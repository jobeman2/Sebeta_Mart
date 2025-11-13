"use client";

import React, { useState, useEffect } from "react";
import { Heart, ShoppingCart } from "lucide-react";

export interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  sellerName: string;
  sellerImage: string;
  image_url?: string; // from backend
}

export default function ProductsGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/productlist");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  if (loading)
    return <p className="p-6 text-gray-500 text-center">Loading products...</p>;
  if (products.length === 0)
    return <p className="p-6 text-gray-500 text-center">No products found.</p>;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header + Category Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-900">All Products</h2>

        <div className="flex gap-4 text-sm uppercase font-medium">
          {["All", "Food & Drinks", "Spices", "Crafts"].map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-3 py-1 rounded-full transition ${
                activeCategory === category
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
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
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
          >
            {/* Image */}
            <div className="relative h-56 w-full bg-gray-100 overflow-hidden rounded-t-xl">
              {product.image_url ? (
                <img
                  src={`http://localhost:5000/${product.image_url}`}
                  alt={product.category}
                  className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No Image
                </div>
              )}

              {/* Action Icons */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button className="bg-white p-2 rounded-full shadow hover:bg-gray-50 transition">
                  <Heart size={16} className="text-red-500" />
                </button>
                <button className="bg-white p-2 rounded-full shadow hover:bg-gray-50 transition">
                  <ShoppingCart size={16} className="text-gray-700" />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 flex flex-col gap-2 flex-grow">
              <p className="text-sm text-gray-500">{product.category}</p>
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="text-blue-600 font-semibold">ETB {product.price}</p>
            </div>

            {/* Seller Info */}
            <div className="flex items-center p-4 bg-gray-50 gap-3 border-t border-gray-100">
              <img
                src={product.sellerImage}
                alt={product.sellerName}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <span className="text-sm font-medium text-gray-700">{product.sellerName}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
