"use client";

import { useEffect, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  MapPin,
  Navigation,
  Clock,
  ShieldCheck,
  CheckCheck,
  Send,
  RefreshCw,
  Calendar,
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
  created_at?: string;
}

interface Toast {
  id: number;
  type: "success" | "error" | "info" | "warning";
  message: string;
  title?: string;
}

interface StatusConfig {
  label: string;
  icon: React.ReactNode;
  nextAction?: string;
}

export default function AssignedOrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);
  const [showDelivered, setShowDelivered] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>("");

  // Pagination state
  const [pendingPage, setPendingPage] = useState(1);
  const [deliveredPage, setDeliveredPage] = useState(1);
  const ordersPerPage = 5;

  // Status configuration
  const getStatusConfig = (status: string): StatusConfig => {
    switch (status.toLowerCase()) {
      case "pending":
      case "assigned":
        return {
          label: "Assigned",
          icon: <Package className="w-4 h-4" />,
          nextAction: "Accept Delivery",
        };
      case "accepted":
        return {
          label: "Accepted",
          icon: <CheckCircle className="w-4 h-4" />,
          nextAction: "On My Way",
        };
      case "on_the_way":
      case "processing":
        return {
          label: "On The Way",
          icon: <Truck className="w-4 h-4" />,
          nextAction: "Mark as Delivered",
        };
      case "delivered":
        return {
          label: "Delivered",
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case "confirmed":
      case "buyer_confirmed":
        return {
          label: "Confirmed",
          icon: <CheckCheck className="w-4 h-4" />,
        };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          icon: <Clock className="w-4 h-4" />,
        };
    }
  };

  // Add toast notification
  const addToast = (type: Toast["type"], message: string, title?: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message, title }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  // Remove toast
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Fetch assigned orders
  const fetchOrders = async () => {
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
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Sort orders by newest first
  const sortedOrders = [...orders].sort((a, b) => b.order_id - a.order_id);

  // Separate orders into pending and delivered
  const pendingOrders = sortedOrders.filter(
    (order) =>
      !["delivered", "confirmed", "buyer_confirmed"].includes(
        order.status.toLowerCase()
      )
  );

  const deliveredOrders = sortedOrders.filter((order) =>
    ["delivered", "confirmed", "buyer_confirmed"].includes(
      order.status.toLowerCase()
    )
  );

  // Pagination calculations
  const totalPendingPages = Math.ceil(pendingOrders.length / ordersPerPage);
  const totalDeliveredPages = Math.ceil(deliveredOrders.length / ordersPerPage);

  // Get current orders for each section
  const indexOfLastPending = pendingPage * ordersPerPage;
  const indexOfFirstPending = indexOfLastPending - ordersPerPage;
  const currentPendingOrders = pendingOrders.slice(
    indexOfFirstPending,
    indexOfLastPending
  );

  const indexOfLastDelivered = deliveredPage * ordersPerPage;
  const indexOfFirstDelivered = indexOfLastDelivered - ordersPerPage;
  const currentDeliveredOrders = deliveredOrders.slice(
    indexOfFirstDelivered,
    indexOfLastDelivered
  );

  // Stats calculation
  const stats = {
    total: orders.length,
    delivered: deliveredOrders.length,
    pending: pendingOrders.length,
    totalRevenue: orders.reduce(
      (sum, order) => sum + parseFloat(order.total_price),
      0
    ),
  };

  // Get next action based on status
  const getNextAction = (order: Order) => {
    const status = order.status.toLowerCase();
    switch (status) {
      case "pending":
      case "assigned":
        return "Accept Delivery";
      case "accepted":
        return "Start Delivery";
      case "on_the_way":
      case "processing":
        return "Mark as Delivered";
      default:
        return null;
    }
  };

  // Open action modal
  const openActionModal = (order: Order, action: string) => {
    setSelectedOrder(order);
    setSelectedAction(action);
    setShowActionModal(true);
  };

  // Format price
  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination component
  const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    type,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    type: "pending" | "delivered";
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between border-t border-gray-300 pt-4 mt-4">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 border border-gray-300 rounded text-sm ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-900 hover:bg-gray-50"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1.5 border border-gray-300 rounded text-sm ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-900 hover:bg-gray-50"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Toast container component
  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-96">
      {toasts.map((toast) => {
        const icon = {
          success: <CheckCircle className="w-5 h-5" />,
          error: <AlertCircle className="w-5 h-5" />,
          info: <Clock className="w-5 h-5" />,
          warning: <AlertTriangle className="w-5 h-5" />,
        }[toast.type];

        return (
          <div
            key={toast.id}
            className="bg-white border border-gray-300 rounded-lg p-4 flex items-start gap-3 animate-in slide-in-from-right duration-300"
          >
            <div className="flex-shrink-0">{icon}</div>
            <div className="flex-1">
              {toast.title && (
                <p className="font-medium text-gray-900">{toast.title}</p>
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

  // Action Modal
  const ActionModal = () => {
    if (!showActionModal || !selectedOrder) return null;

    const statusConfig = getStatusConfig(selectedOrder.status);
    const nextAction = getNextAction(selectedOrder);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-gray-300 rounded-lg max-w-md w-full">
          <div className="p-6 border-b border-gray-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 border border-gray-300 rounded">
                  <CheckCircle className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{nextAction}</h3>
                  <p className="text-sm text-gray-600">
                    Order #{selectedOrder.order_id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowActionModal(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="border border-gray-300 p-4 mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedOrder.customer_name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedOrder.customer_phone}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-3 py-1 bg-gray-100 text-gray-900 text-sm font-medium border border-gray-300 rounded-full flex items-center gap-1.5">
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    ETB {formatPrice(selectedOrder.total_price)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedOrder.quantity} items
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-300 p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-gray-900 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-900 font-medium mb-1">
                    Confirm Action
                  </p>
                  <p className="text-sm text-gray-600">
                    {nextAction === "Mark as Delivered"
                      ? "You are about to mark this order as delivered. The customer will need to confirm receipt."
                      : `You are about to update this order to "${nextAction}".`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-300">
            <div className="flex gap-3">
              <button
                onClick={() => setShowActionModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Action logic here
                  setShowActionModal(false);
                }}
                className="flex-1 px-4 py-3 bg-black text-white hover:bg-gray-800 font-medium border border-black"
              >
                {nextAction}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-gray-300">
              <Truck className="w-6 h-6 text-gray-900" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Delivery Dashboard
            </h2>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-gray-300">
              <Truck className="w-6 h-6 text-gray-900" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Delivery Dashboard
            </h2>
          </div>
        </div>
        <div className="border border-gray-300 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-gray-900" />
            <div>
              <p className="font-medium text-gray-900">Failed to load orders</p>
              <p className="text-sm text-gray-700 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchOrders}
            className="mt-4 px-4 py-2 bg-black text-white hover:bg-gray-800 border border-black font-medium flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <>
        <ToastContainer />
        <div className="bg-white border border-gray-300 rounded-lg p-6 text-center">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 border border-gray-300">
                <Truck className="w-6 h-6 text-gray-900" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Delivery Dashboard
              </h2>
            </div>
          </div>
          <div className="py-12 border border-gray-300">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              No Assigned Orders
            </h3>
            <p className="text-gray-600 mt-1">
              You don't have any orders assigned at the moment.
            </p>
            <button
              onClick={fetchOrders}
              className="mt-6 px-6 py-3 bg-black text-white hover:bg-gray-800 font-medium border border-black flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <ActionModal />

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white  rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 border ">
                <Truck className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Delivery Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage and track your delivery assignments
                </p>
              </div>
            </div>
            <button
              onClick={fetchOrders}
              className="px-4 py-2.5 bg- text-black hover:bg-gray-800 font-medium border flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Active Deliveries */}
        {pendingOrders.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 border border-gray-300">
                    <Clock className="w-6 h-6 text-gray-900" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Active Deliveries ({pendingOrders.length})
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Orders that require your action
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {currentPendingOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const nextAction = getNextAction(order);

                return (
                  <div
                    key={order.order_id}
                    className="bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900">
                              Order #{order.order_id}
                            </h3>
                            <span className="px-3 py-1 bg-gray-100 text-gray-900 text-sm font-medium border border-gray-300 rounded-full flex items-center gap-1.5">
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-gray-900">
                            ETB {formatPrice(order.total_price)}
                          </span>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 border border-gray-300 rounded">
                            <User className="w-4 h-4 text-gray-700" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Customer</p>
                            <p className="font-medium text-gray-900">
                              {order.customer_name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 border border-gray-300 rounded">
                            <Phone className="w-4 h-4 text-gray-700" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-medium text-gray-900">
                              {order.customer_phone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 border border-gray-300 rounded">
                            <ShoppingCart className="w-4 h-4 text-gray-700" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Items</p>
                            <p className="font-medium text-gray-900">
                              {order.quantity} items
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 border border-gray-300 rounded">
                            <DollarSign className="w-4 h-4 text-gray-700" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Unit Price</p>
                            <p className="font-medium text-gray-900">
                              ETB{" "}
                              {(
                                parseFloat(order.total_price) / order.quantity
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t border-gray-300">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                window.open(
                                  `tel:${order.customer_phone}`,
                                  "_blank"
                                )
                              }
                              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2"
                            >
                              <Phone className="w-4 h-4" />
                              Call Customer
                            </button>
                          </div>

                          {nextAction && (
                            <button
                              onClick={() => openActionModal(order, nextAction)}
                              className="px-6 py-3 bg-black text-white hover:bg-gray-800 font-medium border border-black flex items-center justify-center gap-2"
                            >
                              {statusConfig.icon}
                              {nextAction}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Pagination
                currentPage={pendingPage}
                totalPages={totalPendingPages}
                onPageChange={setPendingPage}
                type="pending"
              />
            </div>
          </div>
        )}

        {/* Delivered Orders */}
        {deliveredOrders.length > 0 && (
          <div className="space-y-4">
            <button
              onClick={() => setShowDelivered(!showDelivered)}
              className="w-full bg-white border border-gray-300 rounded-lg p-6 hover:border-gray-400"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 border border-gray-300">
                    <CheckCircle className="w-6 h-6 text-gray-900" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-gray-900">
                      Completed Deliveries ({deliveredOrders.length})
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Orders that have been delivered
                    </p>
                  </div>
                </div>
                {showDelivered ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </div>
            </button>

            {showDelivered && (
              <div className="space-y-4">
                {currentDeliveredOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);

                  return (
                    <div
                      key={order.order_id}
                      className="bg-white border border-gray-300 rounded-lg"
                    >
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-gray-900">
                                Order #{order.order_id}
                              </h3>
                              <span className="px-3 py-1 bg-gray-100 text-gray-900 text-sm font-medium border border-gray-300 rounded-full flex items-center gap-1.5">
                                {statusConfig.icon}
                                {statusConfig.label}
                              </span>
                              {order.requires_confirmation && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-900 text-sm font-medium border border-gray-300 rounded-full flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  Awaiting Confirmation
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-2xl font-bold text-gray-900">
                              ETB {formatPrice(order.total_price)}
                            </span>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 border border-gray-300 rounded">
                              <User className="w-4 h-4 text-gray-700" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Customer</p>
                              <p className="font-medium text-gray-900">
                                {order.customer_name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="p-2 border border-gray-300 rounded">
                              <Phone className="w-4 h-4 text-gray-700" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Phone</p>
                              <p className="font-medium text-gray-900">
                                {order.customer_phone}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="p-2 border border-gray-300 rounded">
                              <ShoppingCart className="w-4 h-4 text-gray-700" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Items</p>
                              <p className="font-medium text-gray-900">
                                {order.quantity} items
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="p-2 border border-gray-300 rounded">
                              <DollarSign className="w-4 h-4 text-gray-700" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Unit Price
                              </p>
                              <p className="font-medium text-gray-900">
                                ETB{" "}
                                {(
                                  parseFloat(order.total_price) / order.quantity
                                ).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Pagination
                  currentPage={deliveredPage}
                  totalPages={totalDeliveredPages}
                  onPageChange={setDeliveredPage}
                  type="delivered"
                />
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="bg-white border border-gray-300 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium text-gray-900">
                {pendingOrders.length} active
              </span>{" "}
              and{" "}
              <span className="font-medium text-gray-900">
                {deliveredOrders.length} completed
              </span>{" "}
              orders
            </div>
            <div className="text-sm text-gray-600">
              Last updated:{" "}
              <span className="font-medium">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
