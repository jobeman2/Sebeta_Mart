"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { 
  Search, Star, ShieldCheck, Store, ShoppingBag, 
  Heart, Package, Users, Grid, List
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url1?: string;
  rating?: number;
  review_count?: number;
  seller_name?: string;
  seller_verified?: boolean;
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

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:5000/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`,
          { credentials: "include" }
        );
        if (!response.ok) throw new Error("Failed to fetch search results");

        const data = await response.json();
        setResults(data.results || []);
      } catch (err: any) {
        setError(err.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, type]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} router={router} query={query} type={type} />;
  if (results.length === 0) return <NoResults query={query} type={type} router={router} />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Results for "{query}"
            </h1>
            <p className="text-gray-600">
              Found {results.length} {type}(s)
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                defaultValue={query}
                placeholder="Search products or sellers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = (e.target as HTMLInputElement).value;
                    router.push(`/search?q=${encodeURIComponent(value)}&type=${type}`);
                  }
                }}
              />
            </div>
          </div>

          {/* Type Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => router.push(`/search?q=${query}&type=product`)}
              className={`px-4 py-2 rounded-lg ${type === "product" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Products
            </button>
            <button
              onClick={() => router.push(`/search?q=${query}&type=seller`)}
              className={`px-4 py-2 rounded-lg ${type === "seller" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Sellers
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-gray-200" : "hover:bg-gray-100"}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-gray-200" : "hover:bg-gray-100"}`}
              >
                <List className="w-5 h-5" />
              </button>
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
          />
        ) : (
          <SellerResults 
            sellers={results as Seller[]}
          />
        )}
      </div>
    </div>
  );
}

function ProductResults({ products, viewMode }: { products: Product[], viewMode: "grid" | "list" }) {
  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/product/${product.id}`}
          className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition ${viewMode === "list" ? "flex" : ""}`}
        >
          {/* Image */}
          <div className={`${viewMode === "list" ? "w-48 flex-shrink-0" : "w-full h-48"}`}>
            {product.image_url1 ? (
              <img
                src={`http://localhost:5000/${product.image_url1}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-4 flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              <div className="text-lg font-bold text-blue-600">ETB {product.price}</div>
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
            
            {product.rating && renderStars(product.rating)}
            
            {/* Seller Info */}
            {product.seller_name && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Store className="w-4 h-4 text-gray-600" />
                    </div>
                    {product.seller_verified && (
                      <div className="absolute -bottom-1 -right-1">
                        <ShieldCheck className="w-3 h-3 text-green-500" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-700">{product.seller_name}</span>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Details
                </button>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function SellerResults({ sellers }: { sellers: Seller[] }) {
  return (
    <div className="space-y-4">
      {sellers.map((seller) => (
        <div
          key={seller.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                {seller.verified && (
                  <div className="absolute -bottom-1 -right-1">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{seller.full_name}</h3>
                <p className="text-gray-600 text-sm">{seller.email}</p>
                {seller.shop_name && (
                  <p className="text-gray-700 text-sm">{seller.shop_name}</p>
                )}
              </div>
            </div>
            <Link
              href={`/seller/${seller.id}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View Shop
            </Link>
          </div>
          
          {/* Stats */}
          {(seller.rating || seller.product_count) && (
            <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
              {seller.rating && (
                <div className="text-sm text-gray-600">
                  Rating: <span className="font-medium">{seller.rating}</span>
                </div>
              )}
              {seller.product_count !== undefined && (
                <div className="text-sm text-gray-600">
                  Products: <span className="font-medium">{seller.product_count}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorDisplay({ error, router, query, type }: any) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-red-400">
          <Search className="w-full h-full" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Search Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => router.push(`/search?q=${query}&type=${type}`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function NoResults({ query, type, router }: any) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
          <Search className="w-full h-full" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h3>
        <p className="text-gray-600 mb-4">
          No {type}s found for "{query}"
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/search?q=&type=product")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse All Products
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
}