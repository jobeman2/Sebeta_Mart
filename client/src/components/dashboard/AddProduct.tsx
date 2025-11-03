"use client";

import { useState, useEffect, useContext } from "react";
import { Tag, DollarSign, Box, Image } from "lucide-react";
import { AuthContext } from "@/context/Authcontext";

export default function AddProductForm() {
  const { user } = useContext(AuthContext);
  const [sellerId, setSellerId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<any[]>([]);

  // Fetch seller info
  useEffect(() => {
    if (!user) return;
    const fetchSeller = async () => {
      try {
        const res = await fetch(`http://localhost:5000/sellers/${user.id}`);
        const data = await res.json();
        if (res.ok) setSellerId(data.id);
        else setError("You are not registered as a seller.");
      } catch {
        setError("Failed to fetch seller info.");
      }
    };
    fetchSeller();
  }, [user]);

  // Fetch seller products
  useEffect(() => {
    if (!sellerId) return;
    const fetchProducts = async () => {
      try {
        const res = await fetch(`http://localhost:5000/products/seller/${sellerId}`);
        const data = await res.json();
        if (res.ok || res.status === 200) setProducts(data);
        else setProducts([]);
      } catch {
        setProducts([]);
      }
    };
    fetchProducts();
  }, [sellerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !price || !sellerId) {
      setError("Product name, price, and seller are required.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("seller_id", sellerId.toString());
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", price);
      formData.append("stock", stock || "0");
      if (file) formData.append("image", file);

      const res = await fetch("http://localhost:5000/products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) setError(data.message || "Failed to create product");
      else {
        setName("");
        setDescription("");
        setPrice("");
        setStock("");
        setFile(null);
        setProducts((prev) => [data, ...prev]);
      }
    } catch {
      setError("Server error while creating product.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="p-6 text-gray-600">Loading user info...</p>;
  if (!sellerId) return <p className="p-6 text-gray-600">{error || "Fetching seller info..."}</p>;

  return (
    <div className="bg-white p-4 ">

   
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-gray-600">
            <Tag className="w-5 h-5" /> Product Name *
          </label>
          <input
            type="text"
            placeholder="Enter product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-gray-600">
            <Tag className="w-5 h-5" /> Description
          </label>
          <textarea
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Price */}
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-5 h-5" /> Price *
            </label>
            <input
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Stock */}
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 text-gray-600">
              <Box className="w-5 h-5" /> Stock
            </label>
            <input
              type="number"
              placeholder="Enter stock quantity"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Image */}
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-gray-600">
            <Image className="w-5 h-5" /> Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:border file:border-gray-300 file:px-3 file:py-2 file:rounded-lg file:bg-gray-50 hover:file:bg-gray-100 cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>

      {/* Product List */}
     
    </div>
  );
}
