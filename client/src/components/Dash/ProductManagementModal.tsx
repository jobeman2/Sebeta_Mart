"use client";

import { useState, useEffect, useContext } from "react";
import { 
  Tag, DollarSign, Box, Image, Upload, Package, Hash, 
  AlertCircle, Check, X, Edit, Trash2, Search, Filter,
  Plus, Eye, ChevronLeft, ChevronRight, AlertTriangle,
  Save, Grid3x3, List
} from "lucide-react";
import { AuthContext } from "@/context/Authcontext";

interface ProductManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId?: string;
  onProductAdded?: (product: any) => void;
}

export default function ProductManagementModal({ 
  isOpen, 
  onClose, 
  sellerId,
  onProductAdded 
}: ProductManagementModalProps) {
  const { user } = useContext(AuthContext);
  const [currentSellerId, setCurrentSellerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Product form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [usage, setUsage] = useState("");
  const [status, setStatus] = useState("active");
  const [formLoading, setFormLoading] = useState(false);
  
  // Product list states
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const itemsPerPage = 8;
  
  // Edit states
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  // Delete states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  
  // Categories, subcategories, brands
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [brandId, setBrandId] = useState("");

  // Fetch seller info
  useEffect(() => {
    if (isOpen && user) {
      const fetchSeller = async () => {
        try {
          if (sellerId) {
            setCurrentSellerId(parseInt(sellerId));
          } else {
            const res = await fetch(`http://localhost:5000/sellers/${user.id}`);
            const data = await res.json();
            if (res.ok) setCurrentSellerId(data.id);
            else setError("You are not registered as a seller.");
          }
        } catch (err) {
          console.error(err);
          setError("Failed to fetch seller info.");
        } finally {
          setLoading(false);
        }
      };
      fetchSeller();
    }
  }, [isOpen, user, sellerId]);

  // Fetch seller products
  useEffect(() => {
    if (!currentSellerId || !isOpen) return;
    
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/products/seller/${currentSellerId}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch products.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [currentSellerId, isOpen]);

  // Fetch categories, subcategories, brands
  useEffect(() => {
    if (!isOpen) return;
    
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
  }, [isOpen]);

  // Preview images
  useEffect(() => {
    const previews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);

    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Form handlers
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 3);
      setFiles(selectedFiles);
    }
  };

  const resetForm = () => {
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
    setEditingProduct(null);
    setShowEditForm(false);
    setExistingImages([]);
    setError("");
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !price || !currentSellerId) {
      setError("Product name, price, and seller are required.");
      return;
    }

    if (parseFloat(price) <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append("seller_id", currentSellerId.toString());
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
        // Add to products list
        setProducts(prev => [data, ...prev]);
        
        // Callback to parent
        if (onProductAdded) {
          onProductAdded(data);
        }

        // Reset form
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setError("Server error while creating product.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !price) {
      setError("Product name and price are required.");
      return;
    }

    if (parseFloat(price) <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    setFormLoading(true);
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

      // Only append new images if any are selected
      if (files.length > 0) {
        files.forEach((file) => formData.append("images", file));
      }

      const res = await fetch(`http://localhost:5000/products/${editingProduct.id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) setError(data.message || "Failed to update product");
      else {
        // Update products list
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? data : p));
        
        // Reset form
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setError("Server error while updating product.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      const res = await fetch(`http://localhost:5000/products/${productToDelete}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setProducts(products.filter(p => p.id !== productToDelete));
        setShowDeleteConfirm(false);
        setProductToDelete(null);
      } else {
        setError("Failed to delete product.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while deleting product.");
    }
  };

  const startEdit = (product: any) => {
    setEditingProduct(product);
    setName(product.name || "");
    setDescription(product.description || "");
    setPrice(product.price?.toString() || "");
    setStock(product.stock?.toString() || "");
    setUsage(product.usage || "");
    setStatus(product.status || "active");
    setCategoryId(product.category_id?.toString() || "");
    setSubcategoryId(product.subcategory_id?.toString() || "");
    setBrandId(product.brand_id?.toString() || "");
    
    // Set existing images
    const images = [];
    if (product.image_url1) images.push(`http://localhost:5000/${product.image_url1}`);
    if (product.image_url2) images.push(`http://localhost:5000/${product.image_url2}`);
    if (product.image_url3) images.push(`http://localhost:5000/${product.image_url3}`);
    setExistingImages(images);
    
    setShowEditForm(true);
  };

  const startDelete = (productId: number) => {
    setProductToDelete(productId);
    setShowDeleteConfirm(true);
  };

  const handleClose = () => {
    resetForm();
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal Container */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {showEditForm ? "Edit Product" : "Product Management"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {showEditForm 
                        ? "Update product information" 
                        : "Manage your product inventory"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {showEditForm && (
                    <button
                      onClick={() => resetForm()}
                      className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Add/Edit Product Form */}
              {showEditForm ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                  <form onSubmit={handleEditProduct} className="space-y-6">
                    {/* Form fields - same as your original AddProduct */}
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

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Images
                        </label>
                        <div className="grid grid-cols-3 gap-4 mb-4">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          New Images (Max 3, optional)
                        </span>
                      </label>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-blue-500 transition-colors">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="p-3 bg-blue-50 rounded-full mb-3">
                            <Upload className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="mb-3">
                            <p className="font-medium text-gray-900">Upload new images</p>
                            <p className="text-sm text-gray-500 mt-1">Will replace existing images</p>
                          </div>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFilesChange}
                            className="w-full max-w-xs text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                          />
                        </div>

                        {filePreviews.length > 0 && (
                          <div className="mt-6">
                            <p className="text-sm font-medium text-gray-700 mb-3">
                              New Images ({filePreviews.length}/3)
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                              {filePreviews.map((src, i) => (
                                <div key={i} className="relative">
                                  <img
                                    src={src}
                                    alt={`preview-${i}`}
                                    className="w-full h-24 object-cover rounded-lg"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                        disabled={formLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {formLoading ? (
                          <span className="flex items-center justify-center gap-3">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
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
              ) : (
                <>
                  {/* Add Product Button */}
                  <button
                    onClick={() => setShowEditForm(true)}
                    className="w-full mb-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-3"
                  >
                    <Plus className="w-5 h-5" />
                    Add New Product
                  </button>

                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Total Products</p>
                          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                        </div>
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600">Active</p>
                          <p className="text-2xl font-bold text-green-700">
                            {products.filter(p => p.status === "active").length}
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600">In Stock</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {products.filter(p => p.stock > 0).length}
                          </p>
                        </div>
                        <Package className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                    
                    <div className="bg-red-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-red-600">Out of Stock</p>
                          <p className="text-2xl font-bold text-red-700">
                            {products.filter(p => p.stock === 0).length}
                          </p>
                        </div>
                        <Package className="w-6 h-6 text-red-400" />
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search products by name or description..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="relative">
                          <Filter className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-xl pl-11 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                          >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                        
                        <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setViewMode("grid")}
                            className={`px-4 py-3 ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-600"}`}
                          >
                            <Grid3x3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setViewMode("list")}
                            className={`px-4 py-3 ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-600"}`}
                          >
                            <List className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Products Display */}
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading products...</p>
                      </div>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No products found</p>
                      {searchTerm && (
                        <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filter</p>
                      )}
                    </div>
                  ) : viewMode === "grid" ? (
                    <>
                      {/* Grid View */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {paginatedProducts.map((product) => (
                          <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all">
                            <div className="flex gap-4">
                              <div className="flex-shrink-0">
                                {product.image_url1 ? (
                                  <img
                                    src={`http://localhost:5000/${product.image_url1}`}
                                    alt={product.name}
                                    className="w-20 h-20 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                                    <p className="text-sm text-gray-500 truncate mt-1">
                                      {product.description || "No description"}
                                    </p>
                                  </div>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    product.status === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {product.status}
                                  </span>
                                </div>
                                
                                <div className="flex items-center justify-between mt-4">
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-gray-400" />
                                    <span className="font-bold text-gray-900">{product.price}</span>
                                  </div>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    product.stock > 10 
                                      ? 'bg-green-100 text-green-800'
                                      : product.stock > 0
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    Stock: {product.stock}
                                  </span>
                                </div>
                                
                                <div className="flex gap-2 mt-4">
                                  <button
                                    onClick={() => startEdit(product)}
                                    className="flex-1 px-3 py-2 border border-blue-600 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Edit className="w-3 h-3" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => startDelete(product.id)}
                                    className="flex-1 px-3 py-2 border border-red-600 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                              <th className="px6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {paginatedProducts.map((product) => (
                              <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                      {product.image_url1 ? (
                                        <img
                                          src={`http://localhost:5000/${product.image_url1}`}
                                          alt={product.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <Package className="w-5 h-5 text-gray-400" />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{product.name}</p>
                                      <p className="text-sm text-gray-500 truncate max-w-xs">
                                        {product.description || "No description"}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 text-gray-400" />
                                    <span className="font-semibold">{product.price}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    product.stock > 10 
                                      ? 'bg-green-100 text-green-800'
                                      : product.stock > 0
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {product.stock} units
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    product.status === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {product.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => startEdit(product)}
                                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Edit"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => startDelete(product.id)}
                                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                        <span className="font-medium">
                          {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
                        </span>{" "}
                        of <span className="font-medium">{filteredProducts.length}</span> products
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 rounded-lg ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this product? All product data will be permanently removed.
                </p>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setProductToDelete(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all"
                  >
                    Delete Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}