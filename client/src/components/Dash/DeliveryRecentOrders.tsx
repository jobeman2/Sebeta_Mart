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
}

interface Toast {
  id: number;
  type: "success" | "error" | "info" | "warning";
  message: string;
  title?: string;
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [deliveredPage, setDeliveredPage] = useState(1);
  const ordersPerPage = 5;

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
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
      setError("Server error fetching orders");
    } finally {
      setLoading(false);
    }
  };

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
      // First, attempt to complete the delivery
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

      // Check if order requires customer confirmation
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

      fetchOrders(); // Refresh list
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

  useEffect(() => {
    fetchOrders();
  }, []);

  // Separate orders into pending and delivered
  const pendingOrders = orders.filter((order) => order.status !== "delivered");
  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
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

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pageNumbers.push(i);
      }
    }

    return (
      <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
        <div className="text-sm text-gray-700">
          Showing{" "}
          {type === "pending"
            ? indexOfFirstPending + 1
            : indexOfFirstDelivered + 1}{" "}
          to{" "}
          {type === "pending"
            ? Math.min(indexOfLastPending, pendingOrders.length)
            : Math.min(indexOfLastDelivered, deliveredOrders.length)}{" "}
          of{" "}
          {type === "pending" ? pendingOrders.length : deliveredOrders.length}{" "}
          orders
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pageNumbers.map((number, index) => (
            <div key={number} className="flex items-center">
              {index > 0 && pageNumbers[index - 1] !== number - 1 && (
                <span className="px-2 text-gray-400">...</span>
              )}
              <button
                onClick={() => onPageChange(number)}
                className={`px-3 py-1 text-sm rounded-md ${
                  currentPage === number
                    ? "bg-[#3399FF] text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {number}
              </button>
            </div>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-50"
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
        const borderColor = {
          success: "border-l-green-500",
          error: "border-l-red-500",
          info: "border-l-[#3399FF]",
          warning: "border-l-yellow-500",
        }[toast.type];

        const iconColor = {
          success: "text-green-600",
          error: "text-red-600",
          info: "text-[#3399FF]",
          warning: "text-yellow-600",
        }[toast.type];

        const icon = {
          success: <CheckCircle className="w-5 h-5" />,
          error: <AlertCircle className="w-5 h-5" />,
          info: <AlertCircle className="w-5 h-5" />,
          warning: <AlertTriangle className="w-5 h-5" />,
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`bg-white border border-gray-300 rounded-lg shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right duration-300 ${borderColor} border-l-4`}
          >
            <div className={`${iconColor} flex-shrink-0`}>{icon}</div>
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
            <div className="p-2 bg-gray-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-gray-700" />
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
              Are you sure you have delivered the order to{" "}
              <span className="font-semibold">
                {selectedOrder.customer_name}
              </span>
              ?
            </p>

            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-gray-700 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">
                    Important:
                  </span>{" "}
                  The buyer must confirm receipt before the delivery is fully
                  completed.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">
                  {selectedOrder.customer_name}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">
                  ETB {selectedOrder.total_price}
                </span>
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-700" />
          <p className="mt-2 text-gray-600">Loading assigned orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-gray-700" />
          <div>
            <p className="font-semibold text-gray-900">Error Loading Orders</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <>
        <ToastContainer />
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">
            No Assigned Orders
          </h3>
          <p className="text-gray-500 mt-1">
            You don't have any orders assigned at the moment.
          </p>
          <button
            onClick={fetchOrders}
            className="mt-4 px-4 py-2 bg-[#3399FF] text-white rounded-lg hover:bg-[#2a7acc] transition flex items-center gap-2 mx-auto"
          >
            Refresh
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <ConfirmationModal />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Assigned Orders
            </h1>
            <p className="text-gray-600">
              Manage and track your delivery assignments
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-[#3399FF] text-white rounded-lg hover:bg-[#2a7acc] transition flex items-center gap-2"
          >
            Refresh Orders
          </button>
        </div>

        {/* Recent Orders (Pending) Section */}
        {pendingOrders.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between"></div>

            <div className="space-y-4">
              {currentPendingOrders.map((order) => (
                <div
                  key={order.order_id}
                  className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100">
                          <Package className="h-5 w-5 text-gray-700" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Order #{order.order_id}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-gray-900">
                          ETB {order.total_price}
                        </span>
                        <button
                          onClick={() => initiateCompleteOrder(order)}
                          disabled={completingOrder === order.order_id}
                          className="px-4 py-2 bg-[#3399FF] text-white rounded-lg hover:bg-[#2a7acc] transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {completingOrder === order.order_id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Mark as Delivered
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Customer</p>
                          <p className="font-medium text-gray-900">
                            {order.customer_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Phone className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">
                            {order.customer_phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <ShoppingCart className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Quantity</p>
                          <p className="font-medium text-gray-900">
                            {order.quantity} items
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <DollarSign className="h-4 w-4 text-gray-600" />
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
                  </div>
                </div>
              ))}

              <Pagination
                currentPage={pendingPage}
                totalPages={totalPendingPages}
                onPageChange={setPendingPage}
                type="pending"
              />
            </div>
          </div>
        )}

        {/* Delivered Orders Section */}
        {deliveredOrders.length > 0 && (
          <div className="space-y-4">
            <button
              onClick={() => setShowDelivered(!showDelivered)}
              className="flex items-center justify-between w-full p-4 bg-white border border-gray-300 rounded-xl hover:border-gray-400 transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-gray-700" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-900">
                    Delivered Orders ({deliveredOrders.length})
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Orders that have been completed
                  </p>
                </div>
              </div>
              {showDelivered ? (
                <ChevronUp className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {showDelivered && (
              <div className="space-y-4">
                {currentDeliveredOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                      order.requires_confirmation
                        ? "border-gray-300"
                        : "border-gray-300"
                    }`}
                  >
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-100">
                            <CheckCircle className="h-5 w-5 text-gray-700" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Order #{order.order_id}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                Delivered
                              </span>
                              {order.requires_confirmation && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                  Awaiting Confirmation
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-gray-900">
                            ETB {order.total_price}
                          </span>
                          {order.requires_confirmation ? (
                            <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-200 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Waiting for Buyer
                            </div>
                          ) : (
                            <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Confirmed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Customer</p>
                            <p className="font-medium text-gray-900">
                              {order.customer_name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Phone className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-medium text-gray-900">
                              {order.customer_phone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <ShoppingCart className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Quantity</p>
                            <p className="font-medium text-gray-900">
                              {order.quantity} items
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <DollarSign className="h-4 w-4 text-gray-600" />
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

                      {order.requires_confirmation && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-sm text-yellow-700">
                            <AlertTriangle className="h-4 w-4" />
                            <span>
                              Waiting for customer to confirm receipt. Payment
                              will be released upon confirmation.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

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
        <div className="bg-white rounded-xl p-4 border border-gray-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {pendingOrders.length} pending
              </span>{" "}
              and{" "}
              <span className="font-semibold text-gray-900">
                {deliveredOrders.length} delivered
              </span>{" "}
              orders
            </div>
            <div className="text-sm text-gray-600">
              Last updated:{" "}
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
