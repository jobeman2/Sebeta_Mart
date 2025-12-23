"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  ShoppingCart,
  Store,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

export interface Product {
  id: number;
  name: string;
  price: string;
  category_id: number;
  seller_name: string;
  seller_image: string;
  seller_verified: boolean;
  image_url1?: string;
}

// Category mapping
const CATEGORY_MAP = {
  1: "Electronics",
  3: "Furniture",
  4: "Foods",
  7: "Fashion",
} as const;

type CategoryId = keyof typeof CATEGORY_MAP;

export default function ProductsGrid() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("http://localhost:5000/productlist", {
        credentials: "include",
      });
      const data = await res.json();
      setProducts(data);

      const favRes = await fetch("http://localhost:5000/buyer/favorites", {
        credentials: "include",
      });

      if (favRes.ok) {
        const favData = await favRes.json();
        const favoriteIds = favData.map((f: any) => f.product_id);
        setFavorites(favoriteIds);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const getCategoryName = (categoryId: number): string => {
    return CATEGORY_MAP[categoryId as CategoryId] || "Unknown Category";
  };

  const toggleFavorite = async (productId: number) => {
    try {
      if (favorites.includes(productId)) {
        await fetch("http://localhost:5000/buyer/favorites/remove", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productId }),
          credentials: "include",
        });
        setFavorites(favorites.filter((id) => id !== productId));
      } else {
        await fetch("http://localhost:5000/buyer/favorites/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productId }),
          credentials: "include",
        });
        setFavorites([...favorites, productId]);
      }
    } catch (err) {
      console.error("Error updating favorites:", err);
    }
  };

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((product) => {
          if (activeCategory === "Electronics")
            return product.category_id === 1;
          if (activeCategory === "Furniture") return product.category_id === 3;
          if (activeCategory === "Foods") return product.category_id === 4;
          if (activeCategory === "Fashion") return product.category_id === 7;
          return true;
        });

  const availableCategories = [
    "All",
    ...Array.from(new Set(products.map((p) => getCategoryName(p.category_id)))),
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900">Product Lists</h2>
          {refreshing && (
            <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
          )}
        </div>

        <div className="flex gap-4 text-2xl uppercase">
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`${
                activeCategory === category
                  ? "text-blue-600 uppercase border-b-2 border-blue-600"
                  : "text-gray-700 uppercase"
              } text-sm uppercase font-medium`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#EBEBEB] rounded-lg animate-pulse p-4"
              >
                <div className="h-40 bg-gray-200 rounded-md mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="flex justify-between items-center">
                  <div className="h-8 w-24 bg-gray-200 rounded" />
                  <div className="h-8 w-8 bg-gray-200 rounded-full" />
                </div>
                <div className="flex items-center mt-4 gap-2">
                  <div className="h-6 w-6 bg-gray-200 rounded-full" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              </div>
            ))
          : filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border-1 border-[#EBEBEB] rounded-lg transition hover:shadow-md relative group"
              >
                {/* Image Section */}
                <div className="-50 h-50 flex justify-center items-center relative mb-4">
                  {product.image_url1 ? (
                    <img
                      src={product.image_url1}
                      alt={product.name}
                      className="w-46 h-46 flex justify-center object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="text-gray-400">No Image</div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {product.name}
                  </h3>
                  <p className="text-[#EF837B] font-medium">
                    ETB {product.price}
                  </p>

                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => router.push(`/product/${product.id}`)}
                      className="flex items-right p-2 rounded-none border border-gray-300 hover:bg-gray-100 transition gap-2 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      <ShoppingCart className="w-4 h-4" /> Order Now
                    </button>
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="p-2 border border-gray-300 hover:bg-gray-100 rounded-full transition"
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={
                          favorites.includes(product.id) ? "#EF4444" : "none"
                        }
                        stroke={
                          favorites.includes(product.id) ? "#EF4444" : "#000000"
                        }
                      />
                    </button>
                  </div>
                </div>

                {/* Seller Section */}
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <Store className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-800">
                          {product.seller_name || "Unknown Seller"}
                        </h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          {product.seller_verified ? (
                            <>
                              <ShieldCheck className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-600 font-medium">
                                Verified Seller
                              </span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-red-500">
                                Unverified Seller
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-2 py-1 bg-blue-50 rounded-md">
                      <span className="text-xs font-medium text-blue-600">
                        Shop
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Centered Refresh Icon with Text */}
      <div className="mt-12 flex justify-center items-center">
        <div
          onClick={fetchData}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors group"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              refreshing
                ? "animate-spin"
                : "group-hover:rotate-180 transition-transform duration-300"
            }`}
          />
          <span className="text-sm font-medium">
            {refreshing ? "Refreshing..." : "Refresh"}
          </span>
        </div>
      </div>
    </section>
  );
}
