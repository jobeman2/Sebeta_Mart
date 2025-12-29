"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  sellerName: string;
  sellerImage: string;
  image_url?: string;
}

export default function ProductsGrid() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]); // store favorite product IDs
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  // Fetch products and user favorites
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Products
        const res = await fetch("http://localhost:5000/productlist", {
          credentials: "include",
        });
        const data = await res.json();
        setProducts(data);

        // Favorites for logged-in user
        const favRes = await fetch("http://localhost:5000/buyer/favorites", {
          credentials: "include",
        });
        const favData = await favRes.json();
        setFavorites(favData.map((f: any) => f.product_id));
      } catch (err) {
        console.error("Failed to fetch products or favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  // Toggle favorite
  const toggleFavorite = async (productId: number) => {
    try {
      if (favorites.includes(productId)) {
        // Remove from favorites
        await fetch("http://localhost:5000/buyer/favorites/remove", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productId }),
          credentials: "include",
        });
        setFavorites(favorites.filter((id) => id !== productId));
      } else {
        // Add to favorites
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
      : products.filter((p) => p.category === activeCategory);

  if (loading)
    return <p className="p-6 text-gray-600">Loading products...</p>;
  if (products.length === 0)
    return <p className="p-6 text-gray-600">No products found.</p>;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">All Products</h2>
        <div className="flex gap-4 text-sm uppercase font-medium">
          {["All", "Food & Drinks", "Spices", "Crafts"].map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`${
                activeCategory === category
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-700"
              } uppercase`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-[#EBEBEB] rounded-lg transition hover:shadow-md relative"
          >
            {/* Favorite Heart */}
            <button
              onClick={() => toggleFavorite(product.id)}
              className="absolute top-2 right-2 text-red-500 z-10"
            >
              <Heart
                size={24}
                fill={favorites.includes(product.id) ? "red" : "none"}
                stroke="currentColor"
              />
            </button>

            <div className="h-56 flex justify-center items-center overflow-hidden rounded-t-lg bg-gray-100">
              {product.image_url ? (
                <img
                  src={`http://localhost:5000/${product.image_url}`}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="text-gray-400">No Image</div>
              )}
            </div>

            <div className="p-4 flex flex-col gap-2">
              <div className="text-sm text-gray-500">{product.category}</div>
              <h3 className="text-lg font-semibold text-gray-800">
                {product.name}
              </h3>
              <p className="text-[#EF837B] font-medium">ETB {product.price}</p>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  View
                </button>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 gap-3">
              <img
                src={product.sellerImage}
                alt={product.sellerName}
                className="w-10 h-10 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">
                {product.sellerName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
