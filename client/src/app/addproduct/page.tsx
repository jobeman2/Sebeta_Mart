"use client";

import { useState, useEffect, useContext } from "react";
import {
  Tag,
  DollarSign,
  Box,
  Image,
  Upload,
  Package,
  Hash,
  AlertCircle,
  Check,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  Search,
  Filter,
  Calendar,
  BarChart,
} from "lucide-react";
import { AuthContext } from "@/context/Authcontext";

// Product interface
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  subcategory_id: number;
  brand_id: number;
  usage: string;
  status: string;
  created_at: string;
  seller_id: number;
  image_url1?: string;
  image_url2?: string;
  image_url3?: string;
}

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
  const [products, setProducts] = useState<Product[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
  const fetchProducts = async () => {
    if (!sellerId) return;
    try {
      const res = await fetch(
        `http://localhost:5000/products/seller/${sellerId}`
      );
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setProducts([]);
    }
  };

  useEffect(() => {
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
        // Reset form
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

        // Refresh products list
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
      setError("Server error while creating product.");
    } finally {
      setLoading(false);
    }
  };

  // Open modal to view product
  const openViewModal = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Open modal to edit product
  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setIsModalOpen(true);

    // Pre-fill form with product data
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setCategoryId(product.category_id?.toString() || "");
    setSubcategoryId(product.subcategory_id?.toString() || "");
    setBrandId(product.brand_id?.toString() || "");
    setUsage(product.usage || "");
    setStatus(product.status);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setIsEditing(false);

    // Reset form if not in edit mode
    if (!isEditing) {
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setCategoryId("");
      setSubcategoryId("");
      setBrandId("");
      setUsage("");
      setStatus("active");
      setFiles([]);
      setFilePreviews([]);
    }
  };

  // Update product
  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", price);
      formData.append("stock", stock || "0");
      formData.append("category_id", categoryId || "");
      formData.append("subcategory_id", subcategoryId || "");
      formData.append("brand_id", brandId || "");
      formData.append("usage", usage);
      formData.append("status", status);

      // Only append new files if they exist
      files.forEach((file) => formData.append("images", file));

      const res = await fetch(
        `http://localhost:5000/products/${selectedProduct.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (res.ok) {
        fetchProducts();
        closeModal();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update product");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while updating product.");
    } finally {
      setEditLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/products/${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchProducts();
        if (selectedProduct?.id === productId) {
          closeModal();
        }
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete product");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while deleting product.");
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user info...</p>
        </div>
      </div>
    );

  if (!sellerId)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || "Fetching seller info..."}</p>
        </div>
      </div>
    );

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Product Management
          </h1>
          <p className="text-gray-600 mt-2">
            Create, view, edit, and manage your products
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-300 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-[#3399FF] text-white">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEditing ? "Edit Product" : "Add New Product"}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {isEditing
                      ? "Update product details"
                      : "Fill in all required fields marked with *"}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form
                onSubmit={
                  isEditing
                    ? (e) => {
                        e.preventDefault();
                        handleUpdateProduct();
                      }
                    : handleSubmit
                }
                className="space-y-6"
              >
                {/* Name & Description */}
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    rows={4}
                  />
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Price *
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
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

                {/* Image Upload - Only show in add mode or if editing without images */}
                {(!isEditing || files.length > 0) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Product Images (Max 3)
                        {isEditing && (
                          <span className="text-gray-500 text-xs">
                            {" "}
                            - New images will replace existing ones
                          </span>
                        )}
                      </span>
                    </label>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition-colors">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="p-4 bg-blue-50 rounded-full mb-4">
                          <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="mb-4">
                          <p className="font-medium text-gray-900">
                            Drag & drop images or click to browse
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            PNG, JPG, GIF up to 5MB each
                          </p>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFilesChange}
                          className="w-full max-w-xs text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                      </div>

                      {/* Image Previews */}
                      {filePreviews.length > 0 && (
                        <div className="mt-8">
                          <p className="text-sm font-medium text-gray-700 mb-4">
                            Selected Images ({filePreviews.length}/3)
                          </p>
                          <div className="grid grid-cols-3 gap-4">
                            {filePreviews.map((src, i) => (
                              <div key={i} className="relative group">
                                <img
                                  src={src}
                                  alt={`preview-${i}`}
                                  className="w-full h-40 object-cover rounded-lg"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit/Update Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || editLoading}
                    className="w-full py-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading || editLoading ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {isEditing
                          ? "Updating Product..."
                          : "Adding Product..."}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        {isEditing ? (
                          <Save className="w-5 h-5" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                        {isEditing ? "Update Product" : "Add Product"}
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Product List */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-300 rounded-lg p-5 sticky top-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-300">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Your Products
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredProducts.length} of {products.length} products
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">
                    Total
                  </span>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="space-y-3 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">No products found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {searchTerm
                      ? "Try a different search term"
                      : "Add your first product"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border border-gray-300 rounded-lg p-4 hover:border-gray-900 transition-colors group"
                    >
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          {product.image_url1 ? (
                            <img
                              src={`http://localhost:5000/${product.image_url1}`}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Image className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-gray-900 truncate group-hover:text-gray-900">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openViewModal(product)}
                                className="p-1 text-gray-400 hover:text-gray-700"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(product)}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 truncate mt-1">
                            {product.description || "No description"}
                          </p>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">
                                {product.price}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  product.stock > 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {product.stock}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded ${
                                product.status === "active"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {product.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Viewing/Editing Product */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isEditing ? "bg-[#EF837B]" : "bg-[#3399FF]"
                  } text-white`}
                >
                  {isEditing ? (
                    <Edit className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEditing ? "Edit Product" : "Product Details"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    ID: #{selectedProduct.id}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Product Images */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Product Images
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    selectedProduct.image_url1,
                    selectedProduct.image_url2,
                    selectedProduct.image_url3,
                  ]
                    .filter((url) => url)
                    .map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={`http://localhost:5000/${url}`}
                          alt={`Product ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  {[
                    selectedProduct.image_url1,
                    selectedProduct.image_url2,
                    selectedProduct.image_url3,
                  ].filter((url) => url).length === 0 && (
                    <div className="col-span-3 text-center py-12">
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No images available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Product Name
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {selectedProduct.name}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Price
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {selectedProduct.price}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Stock
                  </h4>
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-medium ${
                        selectedProduct.stock > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedProduct.stock} units
                    </p>
                    {selectedProduct.stock <= 10 &&
                      selectedProduct.stock > 0 && (
                        <span className="text-xs text-amber-600">
                          Low stock
                        </span>
                      )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Status
                  </h4>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedProduct.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedProduct.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Usage
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {selectedProduct.usage || "Not specified"}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Date Added
                  </h4>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedProduct.created_at)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">
                  Description
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedProduct.description || "No description provided."}
                </p>
              </div>

              {/* Category Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 mb-1">
                    Category
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {categories.find(
                      (c) => c.id === selectedProduct.category_id
                    )?.name || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 mb-1">
                    Subcategory
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {subcategories.find(
                      (s) => s.id === selectedProduct.subcategory_id
                    )?.name || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-500 mb-1">
                    Brand
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {brands.find((b) => b.id === selectedProduct.brand_id)
                      ?.name || "N/A"}
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-300">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleDeleteProduct(selectedProduct.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Product
                </button>

                {!isEditing && (
                  <button
                    onClick={() => openEditModal(selectedProduct)}
                    className="px-4 py-2 bg-[#3399FF] text-white rounded-lg hover:bg-[#2980d6] transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Product
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
