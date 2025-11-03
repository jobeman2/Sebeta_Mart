"use client";

import { useState, useEffect, useContext } from "react";
import { Tag, DollarSign, Box, Image } from "lucide-react";
import { AuthContext } from "@/context/Authcontext";

export default function AddProductPage() {
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
      } catch (err) {
        console.error(err);
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
      } catch (err) {
        console.error(err);
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

        // Update product list
        setProducts((prev) => [data, ...prev]);
      }
    } catch (err) {
      console.error(err);
      setError("Server error while creating product.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="p-6 text-gray-600">Loading user info...</p>;
  if (!sellerId) return <p className="p-6 text-gray-600">{error || "Fetching seller info..."}</p>;

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-5 text-gray-800">Add New Product</h2>
      {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Product Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <input
              type="number"
              placeholder="Price *"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-gray-500" />
            <input
              type="number"
              placeholder="Stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Image className="w-5 h-5 text-gray-500" />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:border file:border-gray-300 file:px-3 file:py-2 file:rounded-lg file:bg-gray-50 file:text-gray-700 file:cursor-pointer hover:file:bg-gray-100"
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

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Your Products</h3>
        {products.length === 0 ? (
          <p className="text-gray-600">No products yet.</p>
        ) : (
          <ul className="space-y-4">
            {products.map((p) => (
              <li key={p.id} className="border rounded-lg p-3 flex gap-3 items-center">
                {p.image_url ? (
                  <img
                    src={`http://`lo`calhost:5000/${p.image_url}`}
                    alt={p.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-800">{p.name}</p>
                  <p className="text-gray-600 text-sm">{p.description}</p>
                  <p className="text-gray-700 font-semibold">${p.price}</p>
                  <p className="text-gray-500 text-sm">Stock: {p.stock}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
