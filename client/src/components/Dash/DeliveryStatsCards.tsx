"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle,
  Package,
  Phone,
  User,
  ShoppingCart,
  DollarSign,
  Loader2,
  AlertCircle,
  Truck,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
} from "lucide-react";

interface Order {
  order_id: number;
  user_id: number;
  product_id: number;
  seller_id: number;
  quantity: number;
  total_price: string;
  status: string;
  delivery_id: number | null;
  customer_name: string;
  customer_phone: string;
  requires_confirmation?: boolean;
  address?: string;
  delivery_date?: string;
}

interface Toast {
  id: number;
  type: "success" | "error" | "info" | "warning";
  message: string;
  title?: string;
}

interface DeliveryStats {
  total: number;
  pending: number;
  delivered: number;
  awaitingConfirmation: number;
  totalRevenue: number;
  avgDeliveryTime: string;
  onTimeRate: number;
}

export default function AssignedOrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completingOrder, setCompletingOrder] = useState<number | null>(null);
  const [showDelivered, setShowDelivered] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Add toast notification
  const addToast = (type: Toast["type"], message: string, title?: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message, title }]);

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  // Remove toast
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Fetch assigned orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/delivery/complete", {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Error fetching orders");
        setOrders([]);
      } else {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
      setError("Server error fetching orders");
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark order as delivered with confirmation flow
  const initiateCompleteOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowConfirmationModal(true);
  };

  // Complete delivery after confirmation
  const completeOrder = async (orderId: number) => {
    setCompletingOrder(orderId);
    setShowConfirmationModal(false);

    try {
      const res = await fetch("http://localhost:5000/delivery/complete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order_id: orderId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error updating order");
      }

      const result = await res.json();

      if (result.requires_confirmation) {
        addToast(
          "info",
          "Delivery marked as completed. Waiting for customer confirmation.",
          "Waiting for Confirmation"
        );
      } else {
        addToast(
          "success",
          "Order has been successfully delivered and confirmed!",
          "Delivery Completed"
        );
      }

      fetchOrders();
    } catch (err: any) {
      console.error(err);
      addToast(
        "error",
        err.message || "Failed to complete delivery. Please try again.",
        "Delivery Failed"
      );
    } finally {
      setCompletingOrder(null);
      setSelectedOrder(null);
    }
  };

  // Calculate statistics
  const calculateStats = useCallback((): DeliveryStats => {
    const deliveredOrders = orders.filter(
      (order) => order.status === "delivered"
    );
    const pendingOrders = orders.filter(
      (order) => order.status !== "delivered"
    );
    const awaitingConfirmation = deliveredOrders.filter(
      (order) => order.requires_confirmation
    ).length;

    const totalRevenue = orders.reduce(
      (sum, order) => sum + parseFloat(order.total_price),
      0
    );

    // Simulated delivery performance metrics
    const avgDeliveryTime = "45 min";
    const onTimeRate = Math.min(95 + Math.random() * 5, 100);

    return {
      total: orders.length,
      pending: pendingOrders.length,
      delivered: deliveredOrders.length,
      awaitingConfirmation,
      totalRevenue,
      avgDeliveryTime,
      onTimeRate: Math.round(onTimeRate),
    };
  }, [orders]);

  const stats = calculateStats();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Toast container component
  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-96">
      {toasts.map((toast) => {
        const bgColor = {
          success: "bg-white",
          error: "bg-white",
          info: "bg-white",
          warning: "bg-white",
        }[toast.type];

        const borderColor = {
          success: "border-green-200",
          error: "border-red-200",
          info: "border-[#3399FF]/20",
          warning: "border-yellow-200",
        }[toast.type];

        const icon = {
          success: <CheckCircle className="w-5 h-5 text-green-600" />,
          error: <AlertCircle className="w-5 h-5 text-red-600" />,
          info: <AlertCircle className="w-5 h-5 text-[#3399FF]" />,
          warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`${bgColor} border ${borderColor} rounded-lg shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right duration-300`}
          >
            <div className="flex-shrink-0">{icon}</div>
            <div className="flex-1">
              {toast.title && (
                <p className="font-semibold text-gray-900">{toast.title}</p>
              )}
              <p className="text-sm text-gray-700 mt-1">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );

  // Confirmation Modal
  const ConfirmationModal = () => {
    if (!showConfirmationModal || !selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#EF837B]/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-[#EF837B]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Confirm Delivery</h3>
              <p className="text-sm text-gray-600">
                Order #{selectedOrder.order_id}
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-gray-700">
              Confirm delivery to{" "}
              <span className="font-semibold">
                {selectedOrder.customer_name}
              </span>
              ?
            </p>

            <div className="bg-[#3399FF]/10 border border-[#3399FF]/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#3399FF] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  The buyer must confirm receipt before payment is released.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">
                  ETB {selectedOrder.total_price}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Items:</span>
                <span className="font-medium">{selectedOrder.quantity}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowConfirmationModal(false);
                setSelectedOrder(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => completeOrder(selectedOrder.order_id)}
              disabled={completingOrder === selectedOrder.order_id}
              className="flex-1 px-4 py-2 bg-[#3399FF] text-white rounded-lg hover:bg-[#2a7acc] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {completingOrder === selectedOrder.order_id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirm Delivery
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="bg-white border border-gray-300 rounded-lg p-5 animate-pulse"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="flex items-center gap-3 text-gray-700">
          <AlertCircle className="h-6 w-6 text-[#EF837B]" />
          <div>
            <p className="font-semibold text-gray-900">Error Loading Orders</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter((order) => order.status !== "delivered");
  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  );

  return (
    <>
      <ToastContainer />
      <ConfirmationModal />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Delivery Management
            </h2>
            <p className="text-sm text-gray-600">
              Manage your assigned deliveries
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards - Matching previous design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Orders */}
          <div className="bg-white border border-gray-300 rounded-lg p-5 hover:border-gray-900 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-[#3399FF] text-white">
                <Package className="w-5 h-5" />
              </div>
              <div className="text-xs font-medium text-gray-600">
                Assigned to you
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.total}
              </h3>
              <p className="font-medium text-gray-700">Total Orders</p>
            </div>
            <div className="mt-4 h-0.5 w-0 bg-gray-200 group-hover:w-full transition-all duration-300"></div>
          </div>

          {/* Pending Delivery */}
          <div className="bg-white border border-gray-300 rounded-lg p-5 hover:border-gray-900 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-gray-800 text-white">
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-xs font-medium text-gray-600">
                Active deliveries
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.pending}
              </h3>
              <p className="font-medium text-gray-700">Pending Delivery</p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Avg: {stats.avgDeliveryTime}</span>
              </p>
            </div>
            <div className="mt-4 h-0.5 w-0 bg-gray-200 group-hover:w-full transition-all duration-300"></div>
          </div>

          {/* Delivered */}
          <div className="bg-white border border-gray-300 rounded-lg p-5 hover:border-gray-900 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-[#EF837B] text-white">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="text-xs font-medium text-gray-600">
                Completed today
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.delivered}
              </h3>
              <p className="font-medium text-gray-700">Delivered</p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                {stats.awaitingConfirmation} awaiting confirmation
              </p>
            </div>
            <div className="mt-4 h-0.5 w-0 bg-gray-200 group-hover:w-full transition-all duration-300"></div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white border border-gray-300 rounded-lg p-5 hover:border-gray-900 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-gray-700 text-white">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="text-xs font-medium text-gray-600">
                Lifetime earnings
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900">
                ETB {stats.totalRevenue.toLocaleString()}
              </h3>
              <p className="font-medium text-gray-700">Total Revenue</p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{stats.onTimeRate}% on-time rate</span>
              </p>
            </div>
            <div className="mt-4 h-0.5 w-0 bg-gray-200 group-hover:w-full transition-all duration-300"></div>
          </div>
        </div>
      </div>
    </>
  );
}

// Add RefreshCw icon import at top and in imports array
const RefreshCw = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);
