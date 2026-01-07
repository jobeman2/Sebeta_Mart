"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Truck,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  ShoppingBag,
  Navigation,
  MessageSquare,
  ChevronLeft,
  Loader2,
  RefreshCw,
  Star,
  AlertTriangle,
  Home,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface OrderDetail {
  order_id: number;
  product_id: number;
  seller_id: number;
  quantity: number;
  total_price: string;
  status: string;
  delivery_id: number | null;
  vehicle_type: string | null;
  delivery_name: string | null;
  delivery_phone: string | null;
  delivery_latitude: string | null;
  delivery_longitude: string | null;
  created_at: string;
  updated_at: string;
  product_name: string;
  product_description?: string;
  product_image?: string;
  seller_name: string;
  seller_phone?: string;
  seller_address?: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_address: string;
  delivery_address?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  payment_method?: string;
  payment_status?: string;
}

interface StatusStep {
  id: number;
  status: string;
  label: string;
  description: string;
  icon: JSX.Element;
  color: string;
}

export default function BuyerOrderDetails() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showDeliveryMap, setShowDeliveryMap] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  // Status timeline
  const statusSteps: StatusStep[] = [
    {
      id: 1,
      status: "confirmed",
      label: "Order Confirmed",
      description: "Your order has been confirmed",
      icon: <CheckCircle className="w-4 h-4" />,
      color: "#3399FF",
    },
    {
      id: 2,
      status: "processing",
      label: "Processing",
      description: "Seller is preparing your order",
      icon: <Package className="w-4 h-4" />,
      color: "#3399FF",
    },
    {
      id: 3,
      status: "assigned_for_delivery",
      label: "Out for Delivery",
      description: "Delivery person assigned",
      icon: <Truck className="w-4 h-4" />,
      color: "#3399FF",
    },
    {
      id: 4,
      status: "delivered",
      label: "Delivered",
      description: "Order delivered successfully",
      icon: <CheckCircle className="w-4 h-4" />,
      color: "#EF837B",
    },
  ];

  // Fetch order details
  const fetchOrderDetails = useCallback(async () => {
    setRefreshing(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/buyer/orders/${orderId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to fetch order details");
      }

      const data = await res.json();
      setOrder(data.order);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load order details");
      setOrder(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, fetchOrderDetails]);

  // Get current status index
  const getCurrentStatusIndex = () => {
    if (!order) return -1;
    return statusSteps.findIndex((step) => step.status === order.status);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format price
  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-[#EF837B] text-white";
      case "cancelled":
        return "bg-gray-600 text-white";
      case "assigned_for_delivery":
        return "bg-[#3399FF] text-white";
      default:
        return "bg-[#3399FF] text-white";
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Confirmation";
      case "confirmed":
        return "Confirmed";
      case "processing":
        return "Processing";
      case "assigned_for_delivery":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Track delivery
  const trackDelivery = () => {
    if (order?.delivery_latitude && order?.delivery_longitude) {
      const url = `https://www.google.com/maps?q=${order.delivery_latitude},${order.delivery_longitude}`;
      window.open(url, "_blank");
    } else {
      alert("Live tracking is not available for this order");
    }
  };

  // Contact delivery person
  const contactDelivery = () => {
    if (order?.delivery_phone) {
      window.open(`tel:${order.delivery_phone}`, "_blank");
    } else {
      alert("Delivery person contact is not available");
    }
  };

  // Contact seller
  const contactSeller = () => {
    if (order?.seller_phone) {
      window.open(`tel:${order.seller_phone}`, "_blank");
    } else {
      alert("Seller contact is not available");
    }
  };

  // Submit review
  const submitReview = async () => {
    if (!rating || !review.trim()) {
      alert("Please provide both rating and review");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/orders/${orderId}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ rating, review }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit review");
      }

      alert("Thank you for your review!");
      setRating(0);
      setReview("");
      fetchOrderDetails();
    } catch (err: any) {
      alert(err.message || "Failed to submit review");
    }
  };

  // Cancel order
  const cancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/orders/${orderId}/cancel`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to cancel order");
      }

      alert("Order cancelled successfully");
      fetchOrderDetails();
    } catch (err: any) {
      alert(err.message || "Failed to cancel order");
    }
  };

  // Confirm delivery
  const confirmDelivery = async () => {
    if (!confirm("Have you received your order?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/orders/${orderId}/confirm-delivery`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to confirm delivery");
      }

      alert("Delivery confirmed! Thank you.");
      fetchOrderDetails();
    } catch (err: any) {
      alert(err.message || "Failed to confirm delivery");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-300 p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-300 p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-6 h-6" />
              <div>
                <p className="font-semibold">Failed to Load Order</p>
                <p className="text-sm text-gray-600 mt-1">
                  {error || "Order not found"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={fetchOrderDetails}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <Link
                href="/orders"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Order #{order.order_id}
                </h1>
                <p className="text-sm text-gray-600">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchOrderDetails}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Card */}
            <div className="bg-white rounded-xl border border-gray-300">
              <div className="p-6 border-b border-gray-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Order Status
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                      {order.status === "delivered" &&
                        order.actual_delivery && (
                          <span className="text-sm text-gray-600">
                            on {formatDate(order.actual_delivery)}
                          </span>
                        )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ETB {formatPrice(order.total_price)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.quantity} item{order.quantity > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="p-6">
                <div className="space-y-4">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                      <div key={step.id} className="flex items-start gap-4">
                        <div className="relative">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                              isCompleted
                                ? `bg-[${step.color}] border-[${step.color}] text-white`
                                : isCurrent
                                ? "border-[#3399FF] bg-white"
                                : "border-gray-300 bg-gray-50"
                            }`}
                          >
                            {isCompleted ? (
                              step.icon
                            ) : (
                              <div className="w-4 h-4" />
                            )}
                          </div>
                          {index < statusSteps.length - 1 && (
                            <div
                              className={`absolute left-5 top-10 w-0.5 h-12 ${
                                index < currentStatusIndex
                                  ? "bg-[#3399FF]"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p
                              className={`font-medium ${
                                isCompleted || isCurrent
                                  ? "text-gray-900"
                                  : "text-gray-500"
                              }`}
                            >
                              {step.label}
                            </p>
                            {isCurrent && (
                              <span className="text-xs text-[#3399FF] font-medium">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Product Details Card */}
            <div className="bg-white rounded-xl border border-gray-300">
              <div className="p-6 border-b border-gray-300">
                <h2 className="text-lg font-bold text-gray-900">
                  Product Details
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {order.product_image ? (
                    <img
                      src={order.product_image}
                      alt={order.product_name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">
                      {order.product_name}
                    </h3>
                    {order.product_description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {order.product_description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="text-gray-700">
                        Quantity: {order.quantity}
                      </span>
                      <span className="font-medium text-gray-900">
                        ETB {formatPrice(order.total_price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information Card */}
            {(order.delivery_id || order.delivery_address) && (
              <div className="bg-white rounded-xl border border-gray-300">
                <div className="p-6 border-b border-gray-300">
                  <h2 className="text-lg font-bold text-gray-900">
                    Delivery Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Delivery Person */}
                    {order.delivery_id && (
                      <div className="bg-[#3399FF]/5 border border-[#3399FF]/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#3399FF]/10 rounded-lg">
                              <User className="w-5 h-5 text-[#3399FF]" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {order.delivery_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Delivery Person
                              </p>
                            </div>
                          </div>
                          {order.vehicle_type && (
                            <span className="px-3 py-1 bg-white border border-[#3399FF] text-[#3399FF] rounded-full text-sm font-medium">
                              {order.vehicle_type}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {order.delivery_phone && (
                            <button
                              onClick={contactDelivery}
                              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Phone className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-medium">
                                {order.delivery_phone}
                              </span>
                            </button>
                          )}
                          {order.delivery_latitude &&
                            order.delivery_longitude && (
                              <button
                                onClick={trackDelivery}
                                className="flex items-center gap-2 px-3 py-2 bg-[#3399FF] text-white rounded-lg hover:bg-[#2a7acc] transition-colors"
                              >
                                <Navigation className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  Track Delivery
                                </span>
                              </button>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Delivery Address */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Home className="w-5 h-5 text-gray-600" />
                        <h3 className="font-medium text-gray-900">
                          Delivery Address
                        </h3>
                      </div>
                      <p className="text-gray-700">
                        {order.delivery_address || order.buyer_address}
                      </p>
                    </div>

                    {/* Estimated Delivery */}
                    {order.estimated_delivery && (
                      <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800">
                            Estimated delivery:{" "}
                            {formatDate(order.estimated_delivery)}
                          </span>
                        </div>
                        {order.status === "assigned_for_delivery" && (
                          <button
                            onClick={confirmDelivery}
                            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                          >
                            Confirm Receipt
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Seller Information Card */}
            <div className="bg-white rounded-xl border border-gray-300">
              <div className="p-6 border-b border-gray-300">
                <h2 className="text-lg font-bold text-gray-900">
                  Seller Information
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <User className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.seller_name}
                      </p>
                      <p className="text-sm text-gray-600">Seller</p>
                    </div>
                  </div>
                  {order.seller_phone && (
                    <button
                      onClick={contactSeller}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Contact Seller
                    </button>
                  )}
                </div>
                {order.seller_address && (
                  <div className="mt-4 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      {order.seller_address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-xl border border-gray-300">
              <div className="p-6 border-b border-gray-300">
                <h2 className="text-lg font-bold text-gray-900">
                  Order Summary
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      ETB {formatPrice(order.total_price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">Included</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-300">
                    <span>Total</span>
                    <span>ETB {formatPrice(order.total_price)}</span>
                  </div>
                </div>

                {order.payment_method && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-medium">
                        {order.payment_method}
                      </span>
                    </div>
                    {order.payment_status && (
                      <div className="flex justify-between mt-2">
                        <span className="text-gray-600">Payment Status</span>
                        <span
                          className={`font-medium ${
                            order.payment_status === "paid"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {order.payment_status.charAt(0).toUpperCase() +
                            order.payment_status.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-xl border border-gray-300">
              <div className="p-6 border-b border-gray-300">
                <h2 className="text-lg font-bold text-gray-900">Actions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {order.status === "assigned_for_delivery" && (
                    <>
                      {order.delivery_latitude && order.delivery_longitude && (
                        <button
                          onClick={trackDelivery}
                          className="w-full px-4 py-3 bg-[#3399FF] text-white rounded-lg hover:bg-[#2a7acc] transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                          <Navigation className="w-5 h-5" />
                          Track Delivery Live
                        </button>
                      )}
                      <button
                        onClick={confirmDelivery}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Confirm Delivery
                      </button>
                    </>
                  )}

                  {order.status === "delivered" && (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">
                            Delivered Successfully
                          </span>
                        </div>
                        {order.actual_delivery && (
                          <p className="text-sm text-green-700 mt-1">
                            on {formatDate(order.actual_delivery)}
                          </p>
                        )}
                      </div>

                      {/* Review Section */}
                      <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">
                          Leave a Review
                        </h3>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className="p-1"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          placeholder="Share your experience with this product..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3399FF] focus:border-transparent"
                          rows={3}
                        />
                        <button
                          onClick={submitReview}
                          className="w-full px-4 py-2 bg-[#EF837B] text-white rounded-lg hover:bg-[#e5736b] transition-colors font-medium"
                        >
                          Submit Review
                        </button>
                      </div>
                    </div>
                  )}

                  {order.status !== "delivered" &&
                    order.status !== "cancelled" && (
                      <button
                        onClick={cancelOrder}
                        className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        <AlertTriangle className="w-5 h-5" />
                        Cancel Order
                      </button>
                    )}

                  <Link
                    href="/orders"
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Orders
                  </Link>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-white rounded-xl border border-gray-300">
              <div className="p-6 border-b border-gray-300">
                <h2 className="text-lg font-bold text-gray-900">Need Help?</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Contact Support
                  </button>
                  <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Report an Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
