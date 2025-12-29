"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  ShoppingCart,
  Store,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Search,
  X,
  Grid,
  Receipt,
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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Tax rate (15%)
  const TAX_RATE = 0.15;

  // Calculate tax and total price with tax
  const calculatePriceWithTax = (price: string) => {
    const basePrice = parseFloat(price) || 0;
    const tax = basePrice * TAX_RATE;
    const totalWithTax = basePrice + tax;
    return {
      basePrice: basePrice.toFixed(2),
      tax: tax.toFixed(2),
      totalWithTax: totalWithTax.toFixed(2),
    };
  };

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("http://localhost:5000/productlist", {
        credentials: "include",
      });
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);

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

  // Apply filters whenever search term or category changes
  useEffect(() => {
    let filtered = products;

    // Apply category filter
    if (activeCategory !== "All") {
      filtered = filtered.filter((product) => {
        if (activeCategory === "Electronics") return product.category_id === 1;
        if (activeCategory === "Furniture") return product.category_id === 3;
        if (activeCategory === "Foods") return product.category_id === 4;
        if (activeCategory === "Fashion") return product.category_id === 7;
        return true;
      });
    }

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((product) => {
        const productName = product.name.toLowerCase();
        const sellerName = product.seller_name?.toLowerCase() || "";

        // Search in product name OR seller name
        return productName.includes(term) || sellerName.includes(term);
      });
    }

    setFilteredProducts(filtered);
  }, [products, activeCategory, searchTerm]);

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

  const clearSearch = () => {
    setSearchTerm("");
  };

  const availableCategories = [
    "All",
    ...Array.from(new Set(products.map((p) => getCategoryName(p.category_id)))),
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section - Minimal Black & White */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Grid className="w-5 h-5 text-gray-900" />
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Products
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              Browse {products.length} items from verified sellers
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                +15% VAT included
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white text-sm"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <button
              onClick={fetchData}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 text-gray-700 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Category Tabs - Minimal */}
        <div className="mt-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-1">
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Indicator */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {searchTerm ? (
              <span>
                {filteredProducts.length} result
                {filteredProducts.length !== 1 ? "s" : ""} for "{searchTerm}"
              </span>
            ) : (
              <span>
                Showing {filteredProducts.length} of {products.length} products
              </span>
            )}
          </div>

          {(searchTerm || activeCategory !== "All") && (
            <button
              onClick={() => {
                setSearchTerm("");
                handleCategoryChange("All");
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
          : filteredProducts.map((product) => {
              const priceDetails = calculatePriceWithTax(product.price);

              return (
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

                    {/* Price Display with Tax */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#EF837B] font-medium text-lg">
                            ETB {priceDetails.totalWithTax}
                          </p>
                          <p className="text-xs text-gray-500">
                            Total with 15% VAT
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Receipt className="w-3 h-3" />
                          <span>VAT incl.</span>
                        </div>
                      </div>

                      {/* Price Breakdown Tooltip */}
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <div className="flex justify-between">
                          <span>Base Price:</span>
                          <span>ETB {priceDetails.basePrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>VAT (15%):</span>
                          <span className="text-[#EF837B]">
                            + ETB {priceDetails.tax}
                          </span>
                        </div>
                        <div className="border-t border-gray-200 pt-1 mt-1 flex justify-between font-medium">
                          <span>Final Price:</span>
                          <span className="text-gray-900">
                            ETB {priceDetails.totalWithTax}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      {product.seller_verified ? (
                        <button
                          onClick={() => router.push(`/product/${product.id}`)}
                          className="flex items-right p-2 rounded-none border border-gray-300 hover:bg-gray-100 transition gap-2 text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                        >
                          <ShoppingCart className="w-4 h-4" /> Order Now
                        </button>
                      ) : (
                        <div className="px-4 py-2">
                          <span className="text-sm text-gray-500 font-medium">
                            Unverified Seller
                          </span>
                        </div>
                      )}
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
                            favorites.includes(product.id)
                              ? "#EF4444"
                              : "#000000"
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
              );
            })}
      </div>

      {/* No Results Message - Minimal */}
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm
              ? `No results for "${searchTerm}". Try different keywords.`
              : "No products available in this category."}
          </p>
          {(searchTerm || activeCategory !== "All") && (
            <button
              onClick={() => {
                setSearchTerm("");
                handleCategoryChange("All");
              }}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Refresh Footer - Minimal */}
      {!loading && filteredProducts.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredProducts.length}</span>{" "}
              products • <span className="font-medium">{favorites.length}</span>{" "}
              in favorites
              <span className="ml-2 text-xs text-gray-500">
                • All prices include 15% VAT
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <RefreshCw
                  className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
