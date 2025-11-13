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
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [usage, setUsage] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<any[]>([]);

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [brandId, setBrandId] = useState("");

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
        setProducts(data);
      } catch (err) {
        console.error(err);
        setProducts([]);
      }
    };
    fetchProducts();
  }, [sellerId]);

  // Fetch categories, subcategories, brands
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, subRes, brandRes] = await Promise.all([
          fetch("http://localhost:5000/categories"),
          fetch("http://localhost:5000/subcategories"),
          fetch("http://localhost:5000/brands"),
        ]);
        setCategories(await catRes.json());
        setSubcategories(await subRes.json());
        setBrands(await brandRes.json());
      } catch (err) {
        console.error("Failed to fetch options", err);
      }
    };
    fetchOptions();
  }, []);

  // Preview images
  useEffect(() => {
    const previews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);

    // Revoke object URLs on cleanup
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 3); // max 3
      setFiles(selectedFiles);
    }
  };

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
      formData.append("category_id", categoryId || "");
      formData.append("subcategory_id", subcategoryId || "");
      formData.append("brand_id", brandId || "");
      formData.append("usage", usage);
      formData.append("status", status);

      files.forEach((file) => formData.append("images", file));

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
        setFiles([]);
        setFilePreviews([]);
        setCategoryId("");
        setSubcategoryId("");
        setBrandId("");
        setUsage("");
        setStatus("active");

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
        {/* Name */}
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

        {/* Description */}
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />

        {/* Price & Stock */}
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

        {/* Category */}
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Subcategory */}
        <select
          value={subcategoryId}
          onChange={(e) => setSubcategoryId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Subcategory</option>
          {subcategories.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Brand */}
        <select
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Brand</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Usage */}
        <input
          type="text"
          placeholder="Usage (e.g. Men, Women, Electronics)"
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Images */}
        <div>
          <label className="block mb-1 text-gray-600">Upload Images (max 3)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFilesChange}
            className="w-full text-sm text-gray-500 file:border file:border-gray-300 file:px-3 file:py-2 file:rounded-lg file:bg-gray-50 file:text-gray-700 file:cursor-pointer hover:file:bg-gray-100"
          />
          <div className="flex gap-2 mt-2">
            {filePreviews.map((src, i) => (
              <img key={i} src={src} alt={`preview-${i}`} className="w-16 h-16 object-cover rounded" />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>

      {/* Seller Products */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Your Products</h3>
        {products.length === 0 ? (
          <p className="text-gray-600">No products yet.</p>
        ) : (
          <ul className="space-y-4">
            {products.map((p) => (
              <li key={p.id} className="border rounded-lg p-3 flex gap-3 items-center">
                {p.image_url1 ? (
                  <img
                    src={`http://localhost:5000/${p.image_url1}`}
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
                  <p className="text-gray-700 font-semibold">{p.price} Birr</p>
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
