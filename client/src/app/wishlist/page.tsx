"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Heart,
  ShoppingCart,
  Store,
  ShieldCheck,
  Trash2,
  Eye,
  Tag,
  Filter,
  Search,
  Grid,
  List,
  X,
  ChevronRight,
  Package,
  Clock,
  AlertCircle,
  Check,
  Loader2,
  ShoppingBag,
  Star,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface WishlistItem {
  product_id: number;
  name: string;
  price: string;
  image_url1?: string | null;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [deletingItems, setDeletingItems] = useState<number[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sortBy, setSortBy] = useState<
    "recent" | "price-low" | "price-high" | "name"
  >("recent");

  // Toast functions
  const showToast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border animate-slideIn ${
            toast.type === "success"
              ? "bg-white border-gray-200 text-gray-900"
              : toast.type === "error"
              ? "bg-white border-red-200 text-gray-900"
              : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          {toast.type === "success" && <Check className="w-4 h-4" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );

  // Fetch wishlist items
  const fetchWishlistItems = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/buyer/favorites", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch wishlist items");
      }

      const data = await res.json();
      setWishlist(data || []);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to load wishlist", "error");
    }
  }, [showToast]);

  // Fetch wishlist count
  const fetchWishlistCount = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/buyer/favorites/count", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch wishlist count");
      }

      const data = await res.json();
      setWishlistCount(data.count || 0);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  // Fetch both wishlist items and count
  const fetchWishlist = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchWishlistItems(), fetchWishlistCount()]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchWishlistItems, fetchWishlistCount]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Remove item from wishlist
  const removeFromWishlist = async (productId: number, productName: string) => {
    setDeletingItems((prev) => [...prev, productId]);
    try {
      const res = await fetch("http://localhost:5000/buyer/favorites/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product_id: productId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to remove item");
      }

      // Update local state
      setWishlist((prev) =>
        prev.filter((item) => item.product_id !== productId)
      );
      setSelectedItems((prev) => prev.filter((id) => id !== productId));

      // Update count
      setWishlistCount((prev) => Math.max(0, prev - 1));

      showToast(`Removed "${productName}"`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to remove item", "error");
    } finally {
      setDeletingItems((prev) => prev.filter((id) => id !== productId));
    }
  };

  // Remove multiple items
  const removeSelectedItems = async () => {
    if (selectedItems.length === 0) return;

    const itemsToDelete = [...selectedItems];
    setDeletingItems(itemsToDelete);

    try {
      for (const productId of itemsToDelete) {
        await fetch("http://localhost:5000/buyer/favorites/remove", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ product_id: productId }),
        });
      }

      setWishlist((prev) =>
        prev.filter((item) => !itemsToDelete.includes(item.product_id))
      );
      setSelectedItems([]);
      setWishlistCount((prev) => Math.max(0, prev - itemsToDelete.length));

      showToast(`Removed ${itemsToDelete.length} items`, "success");
    } catch (err: any) {
      showToast("Failed to remove items", "error");
    } finally {
      setDeletingItems([]);
    }
  };

  // Add to cart
  const addToCart = async (productId: number, productName: string) => {
    try {
      const res = await fetch("http://localhost:5000/buyer/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add to cart");
      }

      showToast(`Added "${productName}" to cart`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to add to cart", "error");
    }
  };

  // Toggle item selection
  const toggleItemSelection = (productId: number) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (
      selectedItems.length === filteredWishlist.length &&
      filteredWishlist.length > 0
    ) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredWishlist.map((item) => item.product_id));
    }
  };

  // Filter and sort wishlist
  const filteredWishlist = wishlist
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "name":
          return a.name.localeCompare(b.name);
        case "recent":
        default:
          return 0;
      }
    });

  // Format price
  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate total value
  const calculateTotalValue = () => {
    return filteredWishlist.reduce(
      (sum, item) => sum + parseFloat(item.price),
      0
    );
  };

  if (loading && wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <ToastContainer />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
              <p className="text-gray-600 mt-1">Loading...</p>
            </div>
          </div>
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 text-gray-900 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer />

      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
              <p className="text-gray-600 text-sm mt-1">
                {wishlistCount} item{wishlistCount !== 1 ? "s" : ""} saved
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchWishlist}
                disabled={refreshing}
                className="p-2 border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <Loader2
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>

              {selectedItems.length > 0 && (
                <button
                  onClick={removeSelectedItems}
                  disabled={deletingItems.length > 0}
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove ({selectedItems.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 px-3 py-2 focus:outline-none focus:border-gray-900 text-sm"
              >
                <option value="recent">Recently Added</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bulk Actions */}
        {wishlist.length > 0 && (
          <div className="mb-6 p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={
                    selectedItems.length === filteredWishlist.length &&
                    filteredWishlist.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="w-4 h-4 border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  {selectedItems.length > 0
                    ? `${selectedItems.length} item${
                        selectedItems.length !== 1 ? "s" : ""
                      } selected`
                    : "Select all items"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredWishlist.length === 0 ? (
          <div className="text-center py-16 border border-gray-200">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No matching items found" : "Wishlist is empty"}
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              {searchTerm
                ? "Try a different search term"
                : "Save products you love to find them later"}
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 border border-gray-900 text-gray-900 hover:bg-gray-50 transition-colors text-sm"
              >
                Clear Search
              </button>
            ) : (
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors text-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                Browse Products
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Wishlist Items List */}
            <div className="space-y-4">
              {filteredWishlist.map((item) => {
                const isSelected = selectedItems.includes(item.product_id);
                const isDeleting = deletingItems.includes(item.product_id);

                return (
                  <div
                    key={item.product_id}
                    className={`border border-gray-200 hover:border-gray-300 transition-colors ${
                      isSelected ? "border-gray-900" : ""
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Selection Checkbox */}
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              toggleItemSelection(item.product_id)
                            }
                            className="w-4 h-4 border-gray-300"
                          />
                        </div>

                        {/* Image */}
                        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                          {item.image_url1 ? (
                            <img
                              src={item.image_url1}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900 mb-1">
                                {item.name}
                              </h3>
                              <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-gray-900">
                                  ETB {formatPrice(item.price)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  /unit
                                </span>
                              </div>
                            </div>

                            {/* Price and Actions */}
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    removeFromWishlist(
                                      item.product_id,
                                      item.name
                                    )
                                  }
                                  disabled={isDeleting}
                                  className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                  title="Remove from wishlist"
                                >
                                  {isDeleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4 text-gray-600" />
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    addToCart(item.product_id, item.name)
                                  }
                                  className="p-2 hover:bg-gray-100 transition-colors"
                                  title="Add to cart"
                                >
                                  <ShoppingCart className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                              <button
                                onClick={() =>
                                  router.push(`/product/${item.product_id}`)
                                }
                                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                              >
                                View details
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing {filteredWishlist.length} of {wishlistCount} items
                  {filteredWishlist.length > 0 && (
                    <span className="ml-4 font-medium text-gray-900">
                      Total: ETB {formatPrice(calculateTotalValue().toString())}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchWishlist}
                    disabled={refreshing}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    <Loader2
                      className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </button>
                  <Link
                    href="/products"
                    className="text-sm text-gray-900 hover:text-gray-700 flex items-center gap-1"
                  >
                    Continue Shopping
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add custom animation */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
