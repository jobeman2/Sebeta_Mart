"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Package,
  User,
  Calendar,
  ArrowUpRight,
  ShoppingBag,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface Order {
  order_id: string;
  buyer_name: string;
  buyer_location: string;
  total_price: number;
  status: string;
  product_name: string;
  quantity: number;
  product_image?: string;
  created_at?: string;
}

interface RecentOrdersProps {
  orders: Order[];
  loading?: boolean;
  onViewAll: () => void;
  onViewOrder: (orderId: string) => void;
}

// Updated status color function with buyer_confirmed highlighted in green
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "buyer_confirmed":
      return "bg-green-50 text-green-700 border-green-200"; // Highlighted in green
    case "delivered":
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "shipped":
    case "in_transit":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "processing":
    case "ready_for_delivery":
    case "assigned_for_delivery":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "payment_confirmed":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "pending":
      return "bg-gray-50 text-gray-700 border-gray-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

// Get status icon
const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case "buyer_confirmed":
      return <CheckCircle className="w-3 h-3" />;
    default:
      return null;
  }
};

// Format status text
const formatStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case "buyer_confirmed":
      return "Confirmed";
    case "in_transit":
      return "In Transit";
    case "assigned_for_delivery":
      return "Delivery Assigned";
    case "ready_for_delivery":
      return "Ready for Delivery";
    case "payment_confirmed":
      return "Payment Confirmed";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

// Skeleton loader component
const OrderSkeleton = () => (
  <div className="border-b pb-6 last:border-0 last:pb-0 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-24 h-24 rounded-xl bg-gray-200 flex-shrink-0"></div>
      <div className="flex-1">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="text-right">
            <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="flex items-center gap-2">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-40"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-28"></div>
            <div className="h-4 bg-gray-200 rounded w-36"></div>
          </div>
        </div>
        <div className="h-9 bg-gray-200 rounded-lg w-40"></div>
      </div>
    </div>
  </div>
);

export default function RecentOrders({
  orders,
  loading = false,
  onViewAll,
  onViewOrder,
}: RecentOrdersProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "status">("newest");
  const ordersPerPage = 3;

  // Sort and filter orders: newest first and buyer_confirmed highlighted
  const sortedOrders = useMemo(() => {
    const sorted = [...orders];

    if (sortBy === "newest") {
      // Sort by date (newest first)
      sorted.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === "status") {
      // Sort by status (buyer_confirmed first, then newest)
      sorted.sort((a, b) => {
        const isAConfirmed = a.status.toLowerCase() === "buyer_confirmed";
        const isBConfirmed = b.status.toLowerCase() === "buyer_confirmed";

        if (isAConfirmed && !isBConfirmed) return -1;
        if (!isAConfirmed && isBConfirmed) return 1;

        // If same status, sort by date (newest first)
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    }

    return sorted;
  }, [orders, sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = sortedOrders.slice(startIndex, endIndex);

  // Calculate statistics
  const confirmedOrders = useMemo(
    () =>
      sortedOrders.filter(
        (order) => order.status.toLowerCase() === "buyer_confirmed"
      ).length,
    [sortedOrders]
  );

  const newOrders = useMemo(
    () =>
      sortedOrders.filter((order) => {
        if (!order.created_at) return false;
        const orderDate = new Date(order.created_at);
        const now = new Date();
        const diffTime = now.getTime() - orderDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        return diffDays < 7; // Orders from last 7 days
      }).length,
    [sortedOrders]
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Today";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Reset to first page when sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  return (
    <div className="bg-white border mt-6 border-gray-200 rounded-xl">
      {/* Header */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h2>
            <p className="text-sm text-gray-500">
              Latest customer orders for your shop
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Stats */}
            <div className="flex items-center gap-4">
              {confirmedOrders > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">
                    {confirmedOrders} confirmed
                  </span>
                </div>
              )}
              {newOrders > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">{newOrders} new</span>
                </div>
              )}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Sort by:</span>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setSortBy("newest")}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    sortBy === "newest"
                      ? "bg-[#3399FF] text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => setSortBy("status")}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    sortBy === "status"
                      ? "bg-[#3399FF] text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Status
                </button>
              </div>
            </div>

            {/* View All Button */}
            <button
              onClick={onViewAll}
              className="text-sm font-medium text-[#3399FF] hover:text-[#2980cc] transition-colors flex items-center gap-1"
            >
              View All
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-5">
        {loading ? (
          // Skeleton Loading State
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <OrderSkeleton key={index} />
            ))}
          </div>
        ) : currentOrders.length > 0 ? (
          <div className="space-y-6">
            {currentOrders.map((order) => {
              const isConfirmed =
                order.status.toLowerCase() === "buyer_confirmed";
              const isNew =
                order.created_at &&
                new Date().getTime() - new Date(order.created_at).getTime() <
                  7 * 24 * 60 * 60 * 1000;

              return (
                <div
                  key={order.order_id}
                  className={`border-b pb-6 last:border-0 last:pb-0 ${
                    isConfirmed ? "border-l-4 border-l-green-500 pl-4" : ""
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {/* Order Header Badge */}
                    {isNew && !isConfirmed && (
                      <div className="absolute -top-2 -left-2"></div>
                    )}

                    {/* Product Image */}
                    {order.product_image && (
                      <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                        {isConfirmed && (
                          <div className="absolute top-2 left-2 z-10">
                            <div className="bg-green-500 text-white rounded-full p-1">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                        <img
                          src={order.product_image}
                          alt={order.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                            (
                              e.target as HTMLImageElement
                            ).parentElement!.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-gray-100">
                                <Package class="w-8 h-8 text-gray-400" />
                              </div>
                            `;
                          }}
                        />
                      </div>
                    )}

                    {/* Order Details */}
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">
                              Order #{order.order_id}
                            </h3>
                            {isConfirmed && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {order.product_name}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-lg text-gray-900">
                            ETB {order.total_price.toLocaleString()}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(
                                order.status
                              )} inline-flex items-center justify-center gap-1.5`}
                            >
                              {getStatusIcon(order.status)}
                              {formatStatusText(order.status)}
                            </span>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(order.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              Buyer:{" "}
                              <span className="font-medium text-gray-900">
                                {order.buyer_name}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              Location:{" "}
                              <span className="font-medium text-gray-900">
                                {order.buyer_location}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-gray-600">
                            <span className="text-sm">
                              Quantity:{" "}
                              <span className="font-medium text-gray-900">
                                {order.quantity}
                              </span>
                            </span>
                          </div>
                          <div className="text-gray-600">
                            <span className="text-sm">
                              Total:{" "}
                              <span className="font-medium text-gray-900">
                                ETB {order.total_price.toLocaleString()}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <button
                          onClick={() => onViewOrder(order.order_id)}
                          className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 justify-center flex-1 sm:flex-none ${
                            isConfirmed
                              ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                              : "bg-[#3399FF] text-white hover:bg-[#2980cc]"
                          }`}
                        >
                          <Package className="w-4 h-4" />
                          {isConfirmed
                            ? "View Confirmed Order"
                            : "View Details"}
                        </button>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="hidden sm:inline">•</span>
                          <span>Ordered {formatDate(order.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">No Orders Yet</h4>
            <p className="text-gray-500 text-sm mb-4">
              Your shop hasn't received any orders yet.
            </p>
            <button
              onClick={onViewAll}
              className="text-sm text-[#3399FF] hover:text-[#2980cc] font-medium"
            >
              Explore your products →
            </button>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {sortedOrders.length > ordersPerPage && (
        <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-900">
                {startIndex + 1}-{Math.min(endIndex, sortedOrders.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900">
                {sortedOrders.length}
              </span>{" "}
              orders
              {confirmedOrders > 0 && (
                <span className="ml-2">
                  •{" "}
                  <span className="text-green-600 font-medium">
                    {confirmedOrders} confirmed
                  </span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage === 1) {
                    pageNum = i + 1;
                  } else if (currentPage === totalPages) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-[#3399FF] text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 3 && currentPage < totalPages - 1 && (
                  <>
                    <span className="text-gray-400">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${
                        currentPage === totalPages
                          ? "bg-[#3399FF] text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
