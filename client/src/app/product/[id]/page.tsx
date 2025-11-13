"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/product/${id}`);
        if (!res.ok) {
          setError("Failed to fetch product.");
          return;
        }
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError("Server error while fetching product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p className="p-6 text-gray-600">Loading product...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!product) return <p className="p-6 text-gray-600">Product not found.</p>;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Images */}
        <div className="flex flex-col gap-4">
          {[product.image_url1, product.image_url2, product.image_url3].map(
            (img, idx) =>
              img && (
                <img
                  key={idx}
                  src={`http://localhost:5000/${img}`}
                  alt={`${product.name} ${idx + 1}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-[#EF837B] font-semibold text-xl">ETB {product.price}</p>
          <p className="text-gray-600">{product.description}</p>
          <p className="text-gray-700">Stock: {product.stock}</p>
          <p className="text-gray-700">Category ID: {product.category_id}</p>
          <p className="text-gray-700">Subcategory ID: {product.subcategory_id}</p>
          <p className="text-gray-700">Brand ID: {product.brand_id}</p>
          <p className="text-gray-700">Usage: {product.usage}</p>
          <p className="text-gray-700">Status: {product.status}</p>
        </div>
      </div>
    </div>
  );
}
