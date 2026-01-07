"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import {
  Search,
  Star,
  ShieldCheck,
  Store,
  ShoppingBag,
  Heart,
  Package,
  Users,
  Grid,
  List,
  Filter,
  MapPin,
  Clock,
  ChevronRight,
  X,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image?: string;
  image_url1?: string;
  rating?: number;
  review_count?: number;
  seller_name?: string;
  seller_verified?: boolean;
  seller_id?: number;
  stock?: number;
  created_at?: string;
}

interface Seller {
  id: number;
  full_name: string;
  email: string;
  shop_name?: string;
  verified?: boolean;
  rating?: number;
  product_count?: number;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "product";

  const [results, setResults] = useState<Product[] | Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!query) return;

    setRefreshing(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:5000/search?q=${encodeURIComponent(
          query
        )}&type=${encodeURIComponent(type)}`,
        { credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to fetch search results");

      const data = await response.json();
      setResults(data.results || data || []);

      // Fetch favorites if it's a product search
      if (type === "product") {
        try {
          const favRes = await fetch("http://localhost:5000/buyer/favorites", {
            credentials: "include",
          });
          if (favRes.ok) {
            const favData = await favRes.json();
            const favoriteIds = favData.map((f: any) => f.product_id);
            setFavorites(favoriteIds);
          }
        } catch (err) {
          console.log("Could not fetch favorites");
        }
      }
    } catch (err: any) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [query, type]);

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

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} onRetry={fetchData} />;
  if (results.length === 0)
    return <NoResults query={query} type={type} router={router} />;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Search Results for "
                  <span className="text-black">{query}</span>"
                </h1>
                <p className="text-gray-600">
                  Found {results.length}{" "}
                  {type === "product" ? "product" : "seller"}
                  {results.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    defaultValue={query}
                    placeholder="Search products or sellers..."
                    className="w-full sm:w-64 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const value = (e.target as HTMLInputElement).value;
                        router.push(
                          `/search?q=${encodeURIComponent(value)}&type=${type}`
                        );
                      }
                    }}
                  />
                </div>

                <button
                  onClick={fetchData}
                  className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Type Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => router.push(`/search?q=${query}&type=product`)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  type === "product"
                    ? "bg-black text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Products
              </button>
              <button
                onClick={() => router.push(`/search?q=${query}&type=seller`)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  type === "seller"
                    ? "bg-black text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Store className="w-4 h-4" />
                Sellers
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">View as:</span>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid" ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${
                      viewMode === "list" ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {type === "product" ? (
          <ProductResults
            products={results as Product[]}
            viewMode={viewMode}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        ) : (
          <SellerResults sellers={results as Seller[]} />
        )}
      </div>
    </div>
  );
}

function ProductResults({
  products,
  viewMode,
  favorites,
  toggleFavorite,
}: {
  products: Product[];
  viewMode: "grid" | "list";
  favorites: number[];
  toggleFavorite: (id: number) => void;
}) {
  const router = useRouter();

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    const stars = Math.round(rating);
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < stars ? "fill-black text-black" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 3600 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-300 rounded-lg overflow-hidden hover:border-gray-900 transition-all duration-300 group"
          >
            {/* Image Section */}
            <div className="relative h-48 w-full overflow-hidden bg-gray-100">
              {product.image_url1 || product.image ? (
                <img
                  src={product.image_url1 || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center">
                        <div class="text-gray-400">No Image</div>
                      </div>
                    `;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-black">
                {product.name}
              </h3>

              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-black">
                  ETB {parseFloat(product.price).toLocaleString()}
                </span>
                {renderStars(product.rating)}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                {product.description}
              </p>

              {/* Seller Verification Badge */}
              <div className="mb-3">
                {product.seller_verified ? (
                  <div className="flex items-center gap-1.5 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Verified Seller</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Unverified Seller</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-900 text-gray-900 hover:bg-gray-50 transition-colors text-sm font-medium rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                  View Product
                </button>
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="p-2 border border-gray-300 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Heart
                    className="w-4 h-4"
                    fill={favorites.includes(product.id) ? "#EF4444" : "none"}
                    stroke={
                      favorites.includes(product.id) ? "#EF4444" : "#000000"
                    }
                  />
                </button>
              </div>
            </div>

            {/* Seller Info */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center">
                      <Store className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {product.seller_verified ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">
                            Verified
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Unverified
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {product.created_at && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(product.created_at)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white border border-gray-300 rounded-lg overflow-hidden hover:border-gray-900 transition-all duration-300 group"
        >
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="md:w-48 md:h-48 w-full h-64 bg-gray-100 flex-shrink-0 overflow-hidden">
              {product.image_url1 || product.image ? (
                <img
                  src={product.image_url1 || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center">
                        <div class="text-gray-400">No Image</div>
                      </div>
                    `;
                  }}
                />
              ) : (
                <div className="text-gray-400 w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-black">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Seller Verification */}
                  <div className="mb-3">
                    {product.seller_verified ? (
                      <div className="flex items-center gap-1.5 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Verified Seller
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Unverified Seller</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 mb-4 lg:mb-0 lg:ml-4">
                  <div className="text-2xl font-bold text-black">
                    ETB {parseFloat(product.price).toLocaleString()}
                  </div>
                  {renderStars(product.rating)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push(`/product/${product.id}`)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-900 text-gray-900 hover:bg-gray-50 transition-colors font-medium rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                    View Product
                  </button>
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="p-2.5 border border-gray-300 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Heart
                      className="w-4 h-4"
                      fill={favorites.includes(product.id) ? "#EF4444" : "none"}
                      stroke={
                        favorites.includes(product.id) ? "#EF4444" : "#000000"
                      }
                    />
                  </button>
                </div>
              </div>

              {/* Seller Info */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center">
                      <Store className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {product.seller_name}
                    </p>
                    {product.created_at && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Listed {formatDate(product.created_at)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-black font-medium text-sm flex items-center gap-1">
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SellerResults({ sellers }: { sellers: Seller[] }) {
  const router = useRouter();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sellers.map((seller) => (
        <div
          key={seller.id}
          className="bg-white border border-gray-300 rounded-lg overflow-hidden hover:border-gray-900 transition-all duration-300 group"
        >
          <div className="p-6">
            {/* Seller Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-700" />
                </div>
                {seller.verified && (
                  <div className="absolute -bottom-1 -right-1">
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-green-600 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-black truncate">
                  {seller.full_name}
                </h3>
                {seller.shop_name && (
                  <p className="text-gray-700 text-sm mb-1 truncate">
                    {seller.shop_name}
                  </p>
                )}
                <p className="text-gray-500 text-xs truncate">{seller.email}</p>

                {/* Seller Verification Badge */}
                <div className="mt-2">
                  {seller.verified ? (
                    <div className="flex items-center gap-1.5 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Verified Seller
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Unverified Seller</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="border border-gray-300 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-black mb-1">
                  {seller.rating?.toFixed(1) || "N/A"}
                </div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.round(seller.rating || 0)
                          ? "fill-black text-black"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
              <div className="border border-gray-300 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-black mb-1">
                  {seller.product_count || 0}
                </div>
                <p className="text-xs text-gray-500">Products</p>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => router.push(`/seller/${seller.id}`)}
                className="w-full py-2.5 border border-gray-900 text-gray-900 hover:bg-gray-50 transition-colors font-medium rounded-lg flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4" />
                View Shop
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>

        {/* Results Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-300 rounded-lg p-4 animate-pulse"
            >
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              </div>
              <div className="flex items-center mt-4 gap-2">
                <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorDisplay({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6">
          <div className="w-full h-full border-2 border-gray-300 rounded-full flex items-center justify-center">
            <X className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">Search Failed</h2>

        <p className="text-gray-600 mb-6">{error}</p>

        <button
          onClick={onRetry}
          className="w-full px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 justify-center"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}

function NoResults({ query, type, router }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6">
          <div className="w-full h-full border-2 border-gray-300 rounded-full flex items-center justify-center">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          No Results Found
        </h2>

        <p className="text-gray-600 mb-6">
          No {type}s found for "<span className="font-medium">{query}</span>"
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/products")}
            className="w-full px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 justify-center"
          >
            <ShoppingBag className="w-5 h-5" />
            Browse All Products
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
