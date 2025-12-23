"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  AlertCircle,
  Loader2,
  AlertTriangle,
  MapPin,
  User,
  Phone,
  ShoppingBag,
  DollarSign,
  Calendar,
  RefreshCw,
  Navigation,
  MessageSquare,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";

interface BuyerOrder {
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
  created_at?: string;
  product_name?: string;
  seller_name?: string;
  address?: string;
  estimated_delivery?: string;
}

interface BuyerOrdersDashboardProps {
  limit?: number;
  showOnlyPendingConfirmation?: boolean;
}

export default function BuyerOrdersDashboard({
  limit = 10,
  showOnlyPendingConfirmation = false,
}: BuyerOrdersDashboardProps) {
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [confirmingOrder, setConfirmingOrder] = useState<number | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<BuyerOrder | null>(null);

  // Fetch buyer orders
  const fetchOrders = useCallback(async () => {
    setRefreshing(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/buyer/orders", {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to fetch orders");
      }

      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders that need confirmation (delivered but not buyer_confirmed)
  const ordersNeedingConfirmation = orders.filter(
    (order) => order.status === "delivered"
  );

  const deliveredAndConfirmed = orders.filter(
    (order) => order.status === "buyer_confirmed"
  );

  const activeOrders = orders.filter(
    (order) =>
      order.status !== "delivered" && order.status !== "buyer_confirmed"
  );

  const displayedOrders = showOnlyPendingConfirmation
    ? ordersNeedingConfirmation.slice(0, limit)
    : orders.slice(0, limit);

  // Get status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "buyer_confirmed":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
          icon: <CheckCircle className="w-4 h-4" />,
          text: "Confirmed",
        };
      case "pending":
      case "confirmed":
        return {
          bgColor: "bg-[#3399FF]/10",
          textColor: "text-[#3399FF]",
          borderColor: "border-[#3399FF]/20",
          icon: <Clock className="w-4 h-4" />,
          text: "Confirmed",
        };
      case "processing":
      case "assigned_for_delivery":
        return {
          bgColor: "bg-[#3399FF]/10",
          textColor: "text-[#3399FF]",
          borderColor: "border-[#3399FF]/20",
          icon: <Truck className="w-4 h-4" />,
          text: "On the Way",
        };
      case "delivered":
        return {
          bgColor: "bg-[#EF837B]/10",
          textColor: "text-[#EF837B]",
          borderColor: "border-[#EF837B]/20",
          icon: <CheckCircle className="w-4 h-4" />,
          text: "Delivered - Confirm Receipt",
        };
      case "cancelled":
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-300",
          icon: <AlertCircle className="w-4 h-4" />,
          text: "Cancelled",
        };
      default:
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-300",
          icon: <Package className="w-4 h-4" />,
          text: status.charAt(0).toUpperCase() + status.slice(1),
        };
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format price
  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Get delivery person info
  const getDeliveryInfo = (order: BuyerOrder) => {
    if (!order.delivery_id) return null;

    return {
      name: order.delivery_name || "Delivery Person",
      phone: order.delivery_phone,
      vehicle: order.vehicle_type || "Vehicle",
      hasLocation: !!(order.delivery_latitude && order.delivery_longitude),
    };
  };

  // Open confirmation modal
  const openConfirmationModal = (order: BuyerOrder) => {
    setSelectedOrder(order);
    setShowConfirmationModal(true);
  };

  // Confirm delivery receipt - SIMPLIFIED VERSION
  const confirmDeliveryReceipt = async () => {
    if (!selectedOrder) return;

    setConfirmingOrder(selectedOrder.order_id);

    try {
      const res = await fetch(
        `http://localhost:5000/buyer/orders/${selectedOrder.order_id}/buyer-confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to confirm delivery");
      }

      const result = await res.json();

      if (result.success) {
        alert("Delivery confirmed successfully!");

        // Update local state immediately
        setOrders((prev) =>
          prev.map((order) =>
            order.order_id === selectedOrder.order_id
              ? { ...order, status: "buyer_confirmed" }
              : order
          )
        );

        setShowConfirmationModal(false);
        setSelectedOrder(null);
      } else {
        throw new Error(result.message || "Failed to update order status");
      }
    } catch (err: any) {
      alert(err.message || "Failed to confirm delivery");
    } finally {
      setConfirmingOrder(null);
    }
  };

  // Track delivery
  const trackDelivery = (order: BuyerOrder) => {
    if (order.delivery_latitude && order.delivery_longitude) {
      const url = `https://www.google.com/maps?q=${order.delivery_latitude},${order.delivery_longitude}`;
      window.open(url, "_blank");
    } else {
      alert("Live tracking not available for this order");
    }
  };

  // Contact delivery person
  const contactDelivery = (phone: string | null) => {
    if (phone) {
      window.open(`tel:${phone}`, "_blank");
    } else {
      alert("Contact number not available");
    }
  };

  // Confirmation Modal Component - SIMPLIFIED
  const ConfirmationModal = () => {
    if (!showConfirmationModal || !selectedOrder) return null;

    const deliveryInfo = getDeliveryInfo(selectedOrder);
    const isAlreadyConfirmed = selectedOrder.status === "buyer_confirmed";

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#3399FF]/10 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-[#3399FF]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {isAlreadyConfirmed
                      ? "Already Confirmed"
                      : "Confirm Delivery Receipt"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Order #{selectedOrder.order_id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowConfirmationModal(false);
                  setSelectedOrder(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedOrder.product_name ||
                      `Product #${selectedOrder.product_id}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.quantity} item
                    {selectedOrder.quantity > 1 ? "s" : ""} • ETB{" "}
                    {formatPrice(selectedOrder.total_price)}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            {deliveryInfo && (
              <div className="border border-gray-300 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Delivery Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-700" />
                    <span className="text-sm text-gray-700">
                      {deliveryInfo.name}
                    </span>
                  </div>
                  {deliveryInfo.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-700" />
                      <span className="text-sm text-gray-700">
                        {deliveryInfo.phone}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-gray-700" />
                    <span className="text-sm text-gray-700">
                      {deliveryInfo.vehicle}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Message */}
            {!isAlreadyConfirmed && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    By confirming delivery, you acknowledge that you have
                    received the order in satisfactory condition. This will
                    update the order status to "confirmed".
                  </p>
                </div>
              </div>
            )}

            {/* Already Confirmed Message */}
            {isAlreadyConfirmed && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <p className="text-sm text-green-800">
                    You have already confirmed receipt of this delivery on{" "}
                    {formatDate(selectedOrder.created_at)}.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-300">
            {isAlreadyConfirmed ? (
              <button
                onClick={() => {
                  setShowConfirmationModal(false);
                  setSelectedOrder(null);
                }}
                className="w-full px-4 py-3 bg-[#3399FF] text-white rounded-lg hover:bg-[#2a7acc] transition-colors font-medium"
              >
                Close
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmationModal(false);
                    setSelectedOrder(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeliveryReceipt}
                  disabled={confirmingOrder === selectedOrder.order_id}
                  className="flex-1 px-4 py-3 bg-[#3399FF] text-white rounded-lg hover:bg-[#2a7acc] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {confirmingOrder === selectedOrder.order_id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm Receipt
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-gray-300 rounded-lg">
              <Package className="w-6 h-6 text-gray-900" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {showOnlyPendingConfirmation ? "Confirm Deliveries" : "My Orders"}
            </h2>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#3399FF]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-300 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-gray-300 rounded-lg">
              <Package className="w-6 h-6 text-gray-900" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {showOnlyPendingConfirmation ? "Confirm Deliveries" : "My Orders"}
            </h2>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Failed to load orders</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchOrders}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfirmationModal />
      <div className="bg-white border border-gray-300 rounded-xl p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-gray-300 rounded-lg">
              {showOnlyPendingConfirmation ? (
                <ShieldCheck className="w-6 h-6 text-gray-900" />
              ) : (
                <Package className="w-6 h-6 text-gray-900" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {showOnlyPendingConfirmation
                  ? "Confirm Deliveries"
                  : "My Orders"}
              </h2>
              <p className="text-sm text-gray-600">
                {showOnlyPendingConfirmation
                  ? "Confirm receipt of your delivered orders"
                  : "Track and manage your purchases"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh */}
            <button
              onClick={fetchOrders}
              disabled={refreshing}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        {!showOnlyPendingConfirmation && orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Active Orders</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {activeOrders.length}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700">
                    Awaiting Confirmation
                  </p>
                  <p className="text-2xl font-bold text-amber-900">
                    {ordersNeedingConfirmation.length}
                  </p>
                </div>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Confirmed</p>
                  <p className="text-2xl font-bold text-green-900">
                    {deliveredAndConfirmed.length}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Banner for Confirmations Needed */}
        {showOnlyPendingConfirmation &&
          ordersNeedingConfirmation.length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-[#3399FF] to-[#2a7acc] rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">
                      {ordersNeedingConfirmation.length} Deliveries Awaiting
                      Confirmation
                    </p>
                    <p className="text-sm text-white/90">
                      Confirm receipt to update order status
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* No Orders State */}
        {displayedOrders.length === 0 ? (
          <div className="text-center py-8 border border-gray-300 rounded-lg">
            {showOnlyPendingConfirmation ? (
              <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            ) : (
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            )}
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {showOnlyPendingConfirmation
                ? "No Deliveries to Confirm"
                : "No Orders Found"}
            </h3>
            <p className="text-gray-600 mb-4">
              {showOnlyPendingConfirmation
                ? "All your delivered orders have been confirmed"
                : "Start shopping to see your orders here"}
            </p>
            {!showOnlyPendingConfirmation && (
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#3399FF] text-white rounded-lg hover:bg-[#2a85e6] transition-colors font-medium"
              >
                <Package className="w-4 h-4" />
                Browse Products
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Orders Count */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {displayedOrders.length} order
                {displayedOrders.length !== 1 ? "s" : ""}
                {showOnlyPendingConfirmation && " requiring confirmation"}
              </p>
            </div>

            {/* Orders List */}
            {displayedOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const deliveryInfo = getDeliveryInfo(order);
              const isConfirmed = order.status === "buyer_confirmed";

              return (
                <div
                  key={order.order_id}
                  className="border border-gray-300 rounded-lg hover:border-gray-400 transition-colors group"
                >
                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">
                            Order #{order.order_id}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}
                          >
                            {statusConfig.icon}
                            {statusConfig.text}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-gray-900">
                          ETB {formatPrice(order.total_price)}
                        </span>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            {order.quantity} item{order.quantity > 1 ? "s" : ""}
                          </span>
                        </div>

                        {deliveryInfo && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              {deliveryInfo.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {order.product_name && (
                        <p className="text-sm text-gray-700 truncate max-w-[200px]">
                          {order.product_name}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-300">
                      {deliveryInfo && (
                        <div className="flex items-center gap-2">
                          {deliveryInfo.phone && (
                            <button
                              onClick={() =>
                                contactDelivery(deliveryInfo.phone)
                              }
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium flex items-center gap-1.5"
                            >
                              <Phone className="w-3 h-3" />
                              Contact Delivery
                            </button>
                          )}
                          {deliveryInfo.hasLocation && (
                            <button
                              onClick={() => trackDelivery(order)}
                              className="px-3 py-1.5 bg-[#3399FF]/10 text-[#3399FF] rounded-lg hover:bg-[#3399FF]/20 transition-colors text-xs font-medium flex items-center gap-1.5"
                            >
                              <Navigation className="w-3 h-3" />
                              Track Delivery
                            </button>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {order.status === "delivered" && !isConfirmed && (
                        <button
                          onClick={() => openConfirmationModal(order)}
                          className="px-4 py-2 bg-[#3399FF] text-white rounded-lg hover:bg-[#2a7acc] transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Confirm Delivery
                        </button>
                      )}

                      {isConfirmed && (
                        <button
                          onClick={() => openConfirmationModal(order)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirmed
                        </button>
                      )}

                      {order.status !== "delivered" && !isConfirmed && (
                        <Link
                          href={`/orders/${order.order_id}`}
                          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Link */}
        {!showOnlyPendingConfirmation && orders.length > limit && (
          <div className="mt-6 pt-6 border-t border-gray-300">
            <Link
              href="/orders"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1.5 group justify-center"
            >
              View all orders
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

        {/* Link to Confirmations Page */}
        {!showOnlyPendingConfirmation &&
          ordersNeedingConfirmation.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-300">
              <Link
                href="/orders/confirm"
                className="text-sm font-medium text-[#3399FF] hover:text-[#2a7acc] transition-colors flex items-center gap-1.5 group justify-center"
              >
                <ShieldCheck className="w-4 h-4" />
                Confirm {ordersNeedingConfirmation.length} delivered order
                {ordersNeedingConfirmation.length !== 1 ? "s" : ""}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
      </div>
    </>
  );
}
