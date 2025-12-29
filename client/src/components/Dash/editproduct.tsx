"use client";

import { useState, useEffect, useContext } from "react";
import { Tag, DollarSign, Box, Image, Upload, Package, Hash, AlertCircle, Check, ArrowLeft, Save } from "lucide-react";
import { AuthContext } from "@/context/Authcontext";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

export default function EditProduct() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const [sellerId, setSellerId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [usage, setUsage] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  // Fetch product data
  useEffect(() => {
    if (!sellerId || !productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/products/${productId}`);
        const data = await res.json();
        
        if (res.ok) {
          setName(data.name);
          setDescription(data.description || "");
          setPrice(data.price.toString());
          setStock(data.stock.toString());
          setUsage(data.usage || "");
          setStatus(data.status);
          setCategoryId(data.category_id.toString());
          setSubcategoryId(data.subcategory_id.toString());
          setBrandId(data.brand_id.toString());
          
          // Set existing images
          const images = [];
          if (data.image_url1) images.push(`http://localhost:5000/${data.image_url1}`);
          if (data.image_url2) images.push(`http://localhost:5000/${data.image_url2}`);
          if (data.image_url3) images.push(`http://localhost:5000/${data.image_url3}`);
          setExistingImages(images);
        } else {
          setError("Failed to fetch product data.");
        }
      } catch (err) {
        console.error(err);
        setError("Server error while fetching product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [sellerId, productId]);

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

    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 3);
      setFiles(selectedFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !price || !sellerId) {
      setError("Product name and price are required.");
      return;
    }

    setSaving(true);
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

      const res = await fetch(`http://localhost:5000/products/${productId}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) setError(data.message || "Failed to update product");
      else {
        setSuccess("Product updated successfully!");
        setTimeout(() => {
          router.push("/dashboard/products");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError("Server error while updating product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">User not authenticated</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/products"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-1">Update product information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-600 font-medium">Product updated successfully!</p>
                <p className="text-green-500 text-sm mt-1">Redirecting to products list...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name & Usage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Product Name *
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usage (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Men, Women, Electronics"
                  value={usage}
                  onChange={(e) => setUsage(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Describe your product features, benefits, and specifications..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                rows={3}
              />
            </div>

            {/* Price, Stock & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price *
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Box className="w-4 h-4" />
                    Stock Quantity
                  </span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-4 top-3 w-4 h-4 text-gray-500" />
                  <input
                    type="number"
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Category, Subcategory, Brand */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory *
                </label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                  required
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                  required
                >
                  <option value="">Select Brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Product Images (Max 3)
                </span>
              </label>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-4">Current Images</p>
                  <div className="grid grid-cols-3 gap-4">
                    {existingImages.map((src, i) => (
                      <div key={i} className="relative">
                        <img
                          src={src}
                          alt={`existing-${i}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-blue-500 transition-colors">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="p-4 bg-blue-50 rounded-full mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="mb-4">
                    <p className="font-medium text-gray-900">Upload new images (optional)</p>
                    <p className="text-sm text-gray-500 mt-1">New images will replace existing ones</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilesChange}
                    className="w-full max-w-xs text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>

                {/* New Image Previews */}
                {filePreviews.length > 0 && (
                  <div className="mt-8">
                    <p className="text-sm font-medium text-gray-700 mb-4">
                      New Images ({filePreviews.length}/3)
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {filePreviews.map((src, i) => (
                        <div key={i} className="relative">
                          <img
                            src={src}
                            alt={`new-${i}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Link
                href="/dashboard/products"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving Changes...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <Save className="w-5 h-5" />
                    Save Changes
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}